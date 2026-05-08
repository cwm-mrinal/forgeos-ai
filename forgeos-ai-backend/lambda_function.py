import json
import boto3
import os
import logging
import traceback
from datetime import datetime
from botocore.config import Config

# =========================================================
# Logging
# =========================================================

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# =========================================================
# AWS Bedrock Client
# =========================================================

bedrock_config = Config(
    retries={
        "max_attempts": 3,
        "mode": "standard"
    },
    read_timeout=120,
    connect_timeout=10
)

client = boto3.client(
    "bedrock-runtime",
    region_name=os.environ.get("AWS_REGION", "ap-south-1"),
    config=bedrock_config
)

MODEL_ARN = os.environ["INFERENCE_PROFILE_ARN"]

# =========================================================
# System Prompt
# =========================================================

SYSTEM_PROMPT = """
You are ForgeOS AI — an intelligent multi-domain AI assistant.

Your expertise includes:
- AWS DevOps & Cloud Architecture
- Kubernetes, Terraform, CI/CD
- Fitness & Nutrition Coaching
- Driving Guidance
- Productivity Systems
- Adaptive Scheduling
- Career Guidance
- System Design
- Technical Troubleshooting

Rules:
1. Give concise but practical answers.
2. Use bullet points where useful.
3. Explain technical concepts clearly.
4. Never hallucinate infrastructure details.
5. Prioritize secure and scalable solutions.
6. If user asks code questions, provide production-grade responses.
7. For AWS questions, follow Well-Architected best practices.
"""

# =========================================================
# CORS Headers
# =========================================================

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
}

# =========================================================
# Helper Functions
# =========================================================

def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body)
    }


def extract_user_ip(event):
    try:
        return (
            event.get("requestContext", {})
            .get("identity", {})
            .get("sourceIp", "unknown")
        )
    except Exception:
        return "unknown"


def validate_request(body):
    if not isinstance(body, dict):
        return False, "Invalid JSON body"

    query = body.get("query")

    if not query:
        return False, "query field is required"

    if len(query) > 10000:
        return False, "query too large"

    return True, None


def invoke_bedrock(query, history=None):

    messages = []

    # Add chat history if present
    if history:
        for msg in history[-10:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            messages.append({
                "role": role,
                "content": [{"text": content}]
            })

    # Current user message
    messages.append({
        "role": "user",
        "content": [{"text": query}]
    })

    logger.info("Invoking Bedrock model")

    response = client.converse(
        modelId=MODEL_ARN,
        system=[
            {
                "text": SYSTEM_PROMPT
            }
        ],
        messages=messages,
        inferenceConfig={
            "maxTokens": 2000,
            "temperature": 0.4
        }
    )

    output_text = (
        response["output"]["message"]["content"][0]["text"]
    )

    usage = response.get("usage", {})

    return {
        "answer": output_text,
        "usage": usage
    }


# =========================================================
# Lambda Handler
# =========================================================

def lambda_handler(event, context):

    request_id = context.aws_request_id
    timestamp = datetime.utcnow().isoformat()

    logger.info(f"RequestId={request_id}")
    logger.info(f"Event={json.dumps(event)}")

    # =====================================================
    # Handle OPTIONS
    # =====================================================

    if event.get("httpMethod") == "OPTIONS":
        return response(200, {
            "message": "CORS preflight success"
        })

    try:

        # =================================================
        # Parse Body
        # =================================================

        body = json.loads(event.get("body", "{}"))

        valid, error = validate_request(body)

        if not valid:
            return response(400, {
                "success": False,
                "error": error
            })

        query = body["query"].strip()
        history = body.get("history", [])

        logger.info(f"Query={query}")

        # =================================================
        # Invoke Bedrock
        # =================================================

        ai_response = invoke_bedrock(
            query=query,
            history=history
        )

        # =================================================
        # Success Response
        # =================================================

        return response(200, {
            "success": True,
            "timestamp": timestamp,
            "requestId": request_id,
            "model": MODEL_ARN,
            "query": query,
            "response": ai_response["answer"],
            "usage": ai_response["usage"]
        })

    except client.exceptions.ThrottlingException:

        logger.error("Bedrock throttling")

        return response(429, {
            "success": False,
            "error": "Rate limit exceeded"
        })

    except Exception as e:

        logger.error(traceback.format_exc())

        return response(500, {
            "success": False,
            "error": str(e),
            "requestId": request_id
        })