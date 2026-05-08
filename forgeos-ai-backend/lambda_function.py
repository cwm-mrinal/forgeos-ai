import json
import boto3
import os

client = boto3.client('bedrock-runtime', region_name='ap-south-1')

MODEL_ARN = os.environ['INFERENCE_PROFILE_ARN']

SYSTEM_PROMPT = '''
You are ForgeOS AI.
You help with:
- AWS DevOps Pro
- Fitness coaching
- Driving guidance
- Productivity
- Adaptive schedules
'''

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
}


def lambda_handler(event, context):

    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": ""
        }

    try:
        body = json.loads(event.get('body', '{}'))
        query = body.get('query', '').strip()

        if not query:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "query field is required"})
            }

        response = client.converse(
            modelId=MODEL_ARN,
            system=[{"text": SYSTEM_PROMPT}],
            messages=[
                {
                    "role": "user",
                    "content": [{"text": query}]
                }
            ],
            inferenceConfig={
                "maxTokens": 800,
                "temperature": 0.7
            }
        )

        text = response['output']['message']['content'][0]['text']

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"response": text})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)})
        }
