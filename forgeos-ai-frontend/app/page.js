
'use client'

import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  Brain, Dumbbell, Car, BarChart3, Calendar, Send, Zap,
  Moon, Sun, Clock, ChevronRight, Activity, Target, Award,
  TrendingUp, Flame, Shield, Cpu, BookOpen, FlaskConical,
  Play, X, RotateCcw, ChevronDown, Sparkles, Bot, Menu,
  CheckCircle, Plus, Minus, Trophy
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell
} from 'recharts'

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SCHEDULES = {
  evening: [
    { time: '2:00 AM', end: '9:00 AM', label: 'Deep Sleep', icon: Moon, color: '#6366f1', type: 'sleep' },
    { time: '9:45 AM', end: '11:15 AM', label: 'Gym Session', icon: Dumbbell, color: '#10b981', type: 'gym' },
    { time: '12:15 PM', end: '1:00 PM', label: 'AWS Study', icon: Cpu, color: '#3b82f6', type: 'study' },
    { time: '1:30 PM', end: '2:00 PM', label: 'Leave for Office', icon: Car, color: '#f59e0b', type: 'travel' },
    { time: '3:00 PM', end: '1:00 AM', label: 'Office Shift', icon: Zap, color: '#ec4899', type: 'work' },
  ],
  general: [
    { time: '11:30 PM', end: '6:30 AM', label: 'Deep Sleep', icon: Moon, color: '#6366f1', type: 'sleep' },
    { time: '7:00 AM', end: '8:30 AM', label: 'Gym Session', icon: Dumbbell, color: '#10b981', type: 'gym' },
    { time: '8:30 AM', end: '10:00 AM', label: 'Commute to Office', icon: Car, color: '#f59e0b', type: 'travel' },
    { time: '10:00 AM', end: '7:00 PM', label: 'Office Shift', icon: Zap, color: '#ec4899', type: 'work' },
    { time: '7:30 PM', end: '9:00 PM', label: 'Commute Home', icon: Car, color: '#f59e0b', type: 'travel' },
    { time: '9:30 PM', end: '11:00 PM', label: 'AWS Study', icon: Cpu, color: '#3b82f6', type: 'study' },
  ]
}

const WORKOUTS = [
  {
    id: 'chest', name: 'Chest + Triceps', icon: '💪', color: '#ef4444',
    muscles: ['Pectorals', 'Triceps', 'Front Deltoid'],
    exercises: ['Bench Press', 'Incline Dumbbell', 'Cable Flyes', 'Tricep Pushdown', 'Skull Crushers'],
    sets: '4×12', rest: '90s', calories: 320,
    animation: 'chest',
    tip: 'Keep shoulder blades retracted throughout bench press for maximum chest activation.'
  },
  {
    id: 'back', name: 'Back + Biceps', icon: '🏋️', color: '#3b82f6',
    muscles: ['Latissimus Dorsi', 'Rhomboids', 'Biceps'],
    exercises: ['Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Hammer Curl', 'Face Pulls'],
    sets: '4×10', rest: '90s', calories: 340,
    animation: 'back',
    tip: 'Drive elbows to hips on rows — not hands to chest — for full lat engagement.'
  },
  {
    id: 'shoulders', name: 'Shoulders + Abs', icon: '🎯', color: '#8b5cf6',
    muscles: ['Deltoids', 'Trapezius', 'Core'],
    exercises: ['OHP', 'Lateral Raises', 'Face Pulls', 'Plank', 'Cable Crunches'],
    sets: '4×12', rest: '60s', calories: 280,
    animation: 'shoulders',
    tip: 'Lead lateral raises with your elbows, not your wrists, for better delt isolation.'
  },
  {
    id: 'legs', name: 'Legs', icon: '🦵', color: '#10b981',
    muscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
    exercises: ['Squats', 'Romanian Deadlift', 'Leg Press', 'Lunges', 'Calf Raises'],
    sets: '4×10', rest: '120s', calories: 420,
    animation: 'legs',
    tip: 'Break parallel on squats — depth activates glutes and reduces knee stress.'
  },
  {
    id: 'hiit', name: 'Fat Loss HIIT', icon: '🔥', color: '#f59e0b',
    muscles: ['Full Body', 'Cardiovascular'],
    exercises: ['Burpees', 'Jump Squats', 'Mountain Climbers', 'Box Jumps', 'Sprint Intervals'],
    sets: '6 rounds', rest: '30s', calories: 520,
    animation: 'hiit',
    tip: '20s max effort, 10s rest. Heart rate should hit 85%+ of max for fat burning.'
  },
  {
    id: 'mobility', name: 'Mobility Recovery', icon: '🧘', color: '#06b6d4',
    muscles: ['Hip Flexors', 'Thoracic Spine', 'Hamstrings'],
    exercises: ['Hip 90/90', 'Cat-Cow', "World's Greatest Stretch", 'Pigeon Pose', 'Thoracic Rotation'],
    sets: '3×45s', rest: '15s', calories: 120,
    animation: 'mobility',
    tip: 'Breathe into the stretch — exhale to deepen. Never force range of motion.'
  }
]

const DRIVE_SKILLS_DEFAULT = [
  { name: 'Traffic Driving', icon: '🚦', level: 72, color: '#f59e0b', tip: 'Maintain 3-second following distance in traffic.' },
  { name: 'Highway Driving', icon: '🛣️', level: 85, color: '#3b82f6', tip: 'Check mirrors every 8-10 seconds on highways.' },
  { name: 'Reverse Parking', icon: '🅿️', level: 60, color: '#ec4899', tip: 'Use reference points on your car for consistent parking.' },
  { name: 'Clutch Control', icon: '⚙️', level: 68, color: '#10b981', tip: 'Find the biting point before releasing the handbrake.' },
  { name: 'City Traffic', icon: '🏙️', level: 78, color: '#8b5cf6', tip: 'Anticipate 3 cars ahead, not just the one in front.' },
]

const DEVOPS_MODULES_DEFAULT = [
  { name: 'AWS DevOps Pro', icon: Shield, color: '#f59e0b', progress: 65, topics: 24, done: 16 },
  { name: 'Mock Tests', icon: Target, color: '#3b82f6', progress: 40, topics: 10, done: 4 },
  { name: 'Labs Tracker', icon: FlaskConical, color: '#10b981', progress: 55, topics: 18, done: 10 },
  { name: 'Study Analytics', icon: BarChart3, color: '#8b5cf6', progress: 80, topics: 8, done: 6 },
  { name: 'AI Study Planner', icon: Brain, color: '#ec4899', progress: 30, topics: 12, done: 4 },
]

const WEEKLY_STUDY = [
  { day: 'Mon', hours: 1.5 }, { day: 'Tue', hours: 2 }, { day: 'Wed', hours: 0.5 },
  { day: 'Thu', hours: 2.5 }, { day: 'Fri', hours: 1 }, { day: 'Sat', hours: 3 }, { day: 'Sun', hours: 2 }
]

const FITNESS_RADAR = [
  { subject: 'Strength', A: 78 }, { subject: 'Endurance', A: 65 },
  { subject: 'Flexibility', A: 50 }, { subject: 'Speed', A: 70 },
  { subject: 'Recovery', A: 82 }, { subject: 'Nutrition', A: 60 }
]

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'schedule', label: 'Shift Engine', icon: Calendar },
  { id: 'ai', label: 'AI Coach', icon: Bot },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'drive', label: 'Drive', icon: Car },
  { id: 'devops', label: 'DevOps', icon: Cpu },
]

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function parseScheduleTime(str) {
  const [time, period] = str.split(' ')
  let [h, m] = time.split(':').map(Number)
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return h * 60 + m
}

function isCurrentlyActive(startStr, endStr, now) {
  const start = parseScheduleTime(startStr)
  const end = parseScheduleTime(endStr)
  const cur = now.getHours() * 60 + now.getMinutes()
  return end < start ? cur >= start || cur < end : cur >= start && cur < end
}

function getGreeting(h) {
  if (h >= 5 && h < 12) return 'Good Morning'
  if (h >= 12 && h < 17) return 'Good Afternoon'
  if (h >= 17 && h < 21) return 'Good Evening'
  return 'Good Night'
}

function getGreetingEmoji(h) {
  if (h >= 5 && h < 12) return '🌅'
  if (h >= 12 && h < 17) return '☀️'
  if (h >= 17 && h < 21) return '🌆'
  return '🌙'
}

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDateKey(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function safeLocalGet(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback }
  catch { return fallback }
}

function safeLocalSet(key, val) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ─── TOAST CONTEXT ────────────────────────────────────────────────────────────

const ToastContext = createContext(null)
const useToast = () => useContext(ToastContext)

// ─── HOOKS ────────────────────────────────────────────────────────────────────

function useCurrentTime() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

// ─── COUNT UP ─────────────────────────────────────────────────────────────────

function CountUp({ end, duration = 1400, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0)
  const startRef = useRef(null)
  useEffect(() => {
    startRef.current = null
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts
      const p = Math.min((ts - startRef.current) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * end))
      if (p < 1) requestAnimationFrame(animate)
      else setVal(end)
    }
    requestAnimationFrame(animate)
  }, [end, duration])
  return <>{prefix}{val.toLocaleString()}{suffix}</>
}

// ─── TOAST CONTAINER ─────────────────────────────────────────────────────────

function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass rounded-xl px-4 py-3 flex items-center gap-3 pointer-events-auto shadow-2xl"
            style={{ border: `1px solid ${t.color || '#8b5cf6'}50`, minWidth: '220px', maxWidth: '320px' }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: t.color || '#8b5cf6' }} />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── LIVE CLOCK ───────────────────────────────────────────────────────────────

function LiveClock() {
  const time = useCurrentTime()
  return (
    <span className="text-xs font-mono text-slate-400 hidden sm:block tabular-nums tracking-wide">
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
    </span>
  )
}

// ─── CURRENT ACTIVITY WIDGET ─────────────────────────────────────────────────

function CurrentActivityWidget() {
  const now = useCurrentTime()
  const shiftMode = safeLocalGet('forgeos-shift', 'general')
  const schedule = SCHEDULES[shiftMode] || SCHEDULES.general
  const currentActivity = schedule.find(item => isCurrentlyActive(item.time, item.end, now))

  const commonTime = (
    <div className="text-right flex-shrink-0">
      <p className="text-lg font-mono font-bold text-white tabular-nums">
        {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
      </p>
      <p className="text-xs text-slate-500">Current Time</p>
    </div>
  )

  if (!currentActivity) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-4 flex items-center gap-4"
        style={{ border: '1px solid rgba(99,102,241,0.3)' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.4)' }}>
          <Sparkles size={18} style={{ color: '#6366f1' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Schedule Status</p>
          <p className="font-semibold text-white text-sm">Free Time 🎉</p>
          <p className="text-xs text-slate-500">No active block right now</p>
        </div>
        {commonTime}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      className="glass rounded-2xl p-4 flex items-center gap-4"
      style={{ border: `1px solid ${currentActivity.color}40`, background: `${currentActivity.color}06` }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 pulse-glow"
        style={{ background: `${currentActivity.color}20`, border: `2px solid ${currentActivity.color}60` }}>
        <currentActivity.icon size={18} style={{ color: currentActivity.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: currentActivity.color }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: currentActivity.color }}>Now Active</span>
        </div>
        <p className="font-semibold text-white text-sm truncate">{currentActivity.label}</p>
        <p className="text-xs text-slate-500">{currentActivity.time} → {currentActivity.end}</p>
      </div>
      {commonTime}
    </motion.div>
  )
}

// ─── EXERCISE ANIMATION COMPONENT ────────────────────────────────────────────

function ExerciseDemo({ workout, onClose }) {
  const [phase, setPhase] = useState(0)
  const [rep, setRep] = useState(0)

  const animations = {
    chest: {
      phases: ['Starting Position', 'Lower the Bar', 'Press Up', 'Lock Out'],
      colors: ['#ef4444', '#f97316', '#ef4444', '#dc2626'],
      svgFrames: [
        <g key="c0">
          <rect x="60" y="80" width="80" height="12" rx="6" fill="#94a3b8"/>
          <circle cx="55" cy="86" r="10" fill="#ef4444" opacity="0.8"/>
          <circle cx="145" cy="86" r="10" fill="#ef4444" opacity="0.8"/>
          <ellipse cx="100" cy="110" rx="30" ry="18" fill="#1e40af" opacity="0.6"/>
          <line x1="100" y1="92" x2="100" y2="140" stroke="#60a5fa" strokeWidth="3"/>
          <line x1="100" y1="115" x2="75" y2="135" stroke="#60a5fa" strokeWidth="3"/>
          <line x1="100" y1="115" x2="125" y2="135" stroke="#60a5fa" strokeWidth="3"/>
        </g>,
        <g key="c1">
          <rect x="60" y="105" width="80" height="12" rx="6" fill="#94a3b8"/>
          <circle cx="55" cy="111" r="10" fill="#ef4444" opacity="0.8"/>
          <circle cx="145" cy="111" r="10" fill="#ef4444" opacity="0.8"/>
          <ellipse cx="100" cy="110" rx="30" ry="18" fill="#1e40af" opacity="0.6"/>
          <line x1="100" y1="92" x2="100" y2="140" stroke="#60a5fa" strokeWidth="3"/>
          <line x1="100" y1="115" x2="70" y2="130" stroke="#60a5fa" strokeWidth="3"/>
          <line x1="100" y1="115" x2="130" y2="130" stroke="#60a5fa" strokeWidth="3"/>
          <ellipse cx="100" cy="108" rx="28" ry="6" fill="#ef4444" opacity="0.4" className="muscle-active"/>
        </g>,
      ]
    },
    back: {
      phases: ['Hang Position', 'Initiate Pull', 'Full Contraction', 'Lower Slowly'],
      colors: ['#3b82f6', '#60a5fa', '#3b82f6', '#1d4ed8'],
      svgFrames: [
        <g key="b0">
          <rect x="85" y="40" width="30" height="8" rx="4" fill="#94a3b8"/>
          <line x1="100" y1="48" x2="80" y2="70" stroke="#60a5fa" strokeWidth="3"/>
          <line x1="100" y1="48" x2="120" y2="70" stroke="#60a5fa" strokeWidth="3"/>
          <ellipse cx="100" cy="90" rx="20" ry="28" fill="#1e40af" opacity="0.7"/>
          <line x1="100" y1="118" x2="90" y2="150" stroke="#60a5fa" strokeWidth="3"/>
          <line x1="100" y1="118" x2="110" y2="150" stroke="#60a5fa" strokeWidth="3"/>
        </g>,
        <g key="b1">
          <rect x="85" y="40" width="30" height="8" rx="4" fill="#94a3b8"/>
          <line x1="100" y1="48" x2="75" y2="75" stroke="#60a5fa" strokeWidth="3"/>
          <line x1="100" y1="48" x2="125" y2="75" stroke="#60a5fa" strokeWidth="3"/>
          <ellipse cx="100" cy="80" rx="22" ry="25" fill="#1e40af" opacity="0.7"/>
          <ellipse cx="100" cy="72" rx="18" ry="8" fill="#3b82f6" opacity="0.5" className="muscle-active"/>
          <line x1="100" y1="105" x2="90" y2="140" stroke="#60a5fa" strokeWidth="3"/>
          <line x1="100" y1="105" x2="110" y2="140" stroke="#60a5fa" strokeWidth="3"/>
        </g>,
      ]
    },
    legs: {
      phases: ['Stand Tall', 'Descend', 'Break Parallel', 'Drive Up'],
      colors: ['#10b981', '#34d399', '#10b981', '#059669'],
      svgFrames: [
        <g key="l0">
          <ellipse cx="100" cy="55" rx="18" ry="18" fill="#1e40af" opacity="0.8"/>
          <rect x="84" y="72" width="32" height="45" rx="8" fill="#1e40af" opacity="0.7"/>
          <line x1="90" y1="117" x2="85" y2="160" stroke="#60a5fa" strokeWidth="4"/>
          <line x1="110" y1="117" x2="115" y2="160" stroke="#60a5fa" strokeWidth="4"/>
          <line x1="85" y1="160" x2="80" y2="175" stroke="#60a5fa" strokeWidth="3"/>
          <line x1="115" y1="160" x2="120" y2="175" stroke="#60a5fa" strokeWidth="3"/>
        </g>,
        <g key="l1">
          <ellipse cx="100" cy="75" rx="18" ry="18" fill="#1e40af" opacity="0.8"/>
          <rect x="82" y="90" width="36" height="35" rx="8" fill="#1e40af" opacity="0.7"/>
          <line x1="88" y1="125" x2="70" y2="155" stroke="#60a5fa" strokeWidth="4"/>
          <line x1="112" y1="125" x2="130" y2="155" stroke="#60a5fa" strokeWidth="4"/>
          <line x1="70" y1="155" x2="65" y2="175" stroke="#60a5fa" strokeWidth="3"/>
          <line x1="130" y1="155" x2="135" y2="175" stroke="#60a5fa" strokeWidth="3"/>
          <ellipse cx="79" cy="145" rx="10" ry="18" fill="#10b981" opacity="0.4" className="muscle-active"/>
          <ellipse cx="121" cy="145" rx="10" ry="18" fill="#10b981" opacity="0.4" className="muscle-active"/>
        </g>,
      ]
    },
    hiit: {
      phases: ['Ready', 'Explode Up', 'Peak', 'Land & Reset'],
      colors: ['#f59e0b', '#fbbf24', '#f59e0b', '#d97706'],
      svgFrames: [
        <g key="h0">
          <ellipse cx="100" cy="55" rx="16" ry="16" fill="#f59e0b" opacity="0.9"/>
          <rect x="86" y="70" width="28" height="40" rx="6" fill="#f59e0b" opacity="0.7"/>
          <line x1="92" y1="110" x2="88" y2="150" stroke="#fbbf24" strokeWidth="4"/>
          <line x1="108" y1="110" x2="112" y2="150" stroke="#fbbf24" strokeWidth="4"/>
          <line x1="88" y1="150" x2="84" y2="165" stroke="#fbbf24" strokeWidth="3"/>
          <line x1="112" y1="150" x2="116" y2="165" stroke="#fbbf24" strokeWidth="3"/>
          <line x1="86" y1="80" x2="65" y2="95" stroke="#fbbf24" strokeWidth="3"/>
          <line x1="114" y1="80" x2="135" y2="95" stroke="#fbbf24" strokeWidth="3"/>
        </g>,
        <g key="h1">
          <ellipse cx="100" cy="35" rx="16" ry="16" fill="#f59e0b" opacity="0.9"/>
          <rect x="86" y="50" width="28" height="35" rx="6" fill="#f59e0b" opacity="0.7"/>
          <line x1="92" y1="85" x2="80" y2="115" stroke="#fbbf24" strokeWidth="4"/>
          <line x1="108" y1="85" x2="120" y2="115" stroke="#fbbf24" strokeWidth="4"/>
          <line x1="80" y1="115" x2="76" y2="130" stroke="#fbbf24" strokeWidth="3"/>
          <line x1="120" y1="115" x2="124" y2="130" stroke="#fbbf24" strokeWidth="3"/>
          <line x1="86" y1="62" x2="60" y2="50" stroke="#fbbf24" strokeWidth="3"/>
          <line x1="114" y1="62" x2="140" y2="50" stroke="#fbbf24" strokeWidth="3"/>
          {[...Array(6)].map((_, i) => (
            <circle key={i} cx={85 + i * 6} cy={140 + (i % 2) * 8} r="2" fill="#f59e0b" opacity="0.6" className="particle"/>
          ))}
        </g>,
      ]
    },
    shoulders: {
      phases: ['Arms Down', 'Raise to Parallel', 'Hold', 'Lower Controlled'],
      colors: ['#8b5cf6', '#a78bfa', '#8b5cf6', '#7c3aed'],
      svgFrames: [
        <g key="s0">
          <ellipse cx="100" cy="55" rx="18" ry="18" fill="#1e40af" opacity="0.8"/>
          <rect x="84" y="72" width="32" height="42" rx="8" fill="#1e40af" opacity="0.7"/>
          <line x1="84" y1="82" x2="55" y2="100" stroke="#a78bfa" strokeWidth="3"/>
          <line x1="116" y1="82" x2="145" y2="100" stroke="#a78bfa" strokeWidth="3"/>
          <circle cx="52" cy="102" r="6" fill="#8b5cf6" opacity="0.8"/>
          <circle cx="148" cy="102" r="6" fill="#8b5cf6" opacity="0.8"/>
          <line x1="84" y1="114" x2="78" y2="155" stroke="#a78bfa" strokeWidth="3"/>
          <line x1="116" y1="114" x2="122" y2="155" stroke="#a78bfa" strokeWidth="3"/>
        </g>,
        <g key="s1">
          <ellipse cx="100" cy="55" rx="18" ry="18" fill="#1e40af" opacity="0.8"/>
          <rect x="84" y="72" width="32" height="42" rx="8" fill="#1e40af" opacity="0.7"/>
          <line x1="84" y1="82" x2="50" y2="82" stroke="#a78bfa" strokeWidth="3"/>
          <line x1="116" y1="82" x2="150" y2="82" stroke="#a78bfa" strokeWidth="3"/>
          <circle cx="47" cy="82" r="6" fill="#8b5cf6" opacity="0.8"/>
          <circle cx="153" cy="82" r="6" fill="#8b5cf6" opacity="0.8"/>
          <ellipse cx="67" cy="82" rx="14" ry="6" fill="#8b5cf6" opacity="0.4" className="muscle-active"/>
          <ellipse cx="133" cy="82" rx="14" ry="6" fill="#8b5cf6" opacity="0.4" className="muscle-active"/>
          <line x1="84" y1="114" x2="78" y2="155" stroke="#a78bfa" strokeWidth="3"/>
          <line x1="116" y1="114" x2="122" y2="155" stroke="#a78bfa" strokeWidth="3"/>
        </g>,
      ]
    },
    mobility: {
      phases: ['Neutral', 'Stretch', 'Breathe', 'Deepen'],
      colors: ['#06b6d4', '#22d3ee', '#06b6d4', '#0891b2'],
      svgFrames: [
        <g key="m0">
          <ellipse cx="100" cy="60" rx="16" ry="16" fill="#0e7490" opacity="0.8"/>
          <line x1="100" y1="76" x2="100" y2="120" stroke="#22d3ee" strokeWidth="3"/>
          <line x1="100" y1="90" x2="70" y2="105" stroke="#22d3ee" strokeWidth="3"/>
          <line x1="100" y1="90" x2="130" y2="105" stroke="#22d3ee" strokeWidth="3"/>
          <line x1="100" y1="120" x2="80" y2="155" stroke="#22d3ee" strokeWidth="3"/>
          <line x1="100" y1="120" x2="120" y2="155" stroke="#22d3ee" strokeWidth="3"/>
          <line x1="80" y1="155" x2="75" y2="170" stroke="#22d3ee" strokeWidth="2"/>
          <line x1="120" y1="155" x2="125" y2="170" stroke="#22d3ee" strokeWidth="2"/>
        </g>,
        <g key="m1">
          <ellipse cx="100" cy="55" rx="16" ry="16" fill="#0e7490" opacity="0.8"/>
          <line x1="100" y1="71" x2="100" y2="110" stroke="#22d3ee" strokeWidth="3"/>
          <line x1="100" y1="82" x2="60" y2="75" stroke="#22d3ee" strokeWidth="3"/>
          <line x1="100" y1="82" x2="140" y2="75" stroke="#22d3ee" strokeWidth="3"/>
          <line x1="100" y1="110" x2="70" y2="150" stroke="#22d3ee" strokeWidth="3"/>
          <line x1="100" y1="110" x2="130" y2="150" stroke="#22d3ee" strokeWidth="3"/>
          <line x1="70" y1="150" x2="55" y2="165" stroke="#22d3ee" strokeWidth="2"/>
          <line x1="130" y1="150" x2="145" y2="165" stroke="#22d3ee" strokeWidth="2"/>
          <circle cx="100" cy="83" r="25" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.3" className="muscle-active"/>
        </g>,
      ]
    }
  }

  const anim = animations[workout.animation] || animations.chest
  const frameCount = anim.svgFrames.length

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => {
        const next = (p + 1) % anim.phases.length
        if (next % frameCount === 0) setRep(r => r + 1)
        return next
      })
    }, 900)
    return () => clearInterval(interval)
  }, [anim])

  const currentFrame = anim.svgFrames[phase % frameCount]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        className="glass rounded-3xl p-8 max-w-lg w-full relative"
        style={{ border: `1px solid ${workout.color}40` }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors">
          <X size={20} className="text-slate-400" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{workout.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{workout.name}</h2>
            <p className="text-sm text-slate-400">{workout.sets} · {workout.rest} rest · {workout.calories} kcal</p>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden mb-6" style={{ background: 'rgba(15,23,42,0.8)', border: `1px solid ${workout.color}30` }}>
          <div className="scan-line" style={{ background: `linear-gradient(90deg, transparent, ${workout.color}, transparent)` }} />
          <svg viewBox="0 0 200 200" className="w-full h-48">
            <defs>
              <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={workout.color} stopOpacity="0.05" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect width="200" height="200" fill="url(#bgGrad)" />
            <AnimatePresence mode="wait">
              <motion.g
                key={phase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentFrame}
              </motion.g>
            </AnimatePresence>
          </svg>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {anim.phases.map((p, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === phase % anim.phases.length ? '24px' : '8px',
                  background: i === phase % anim.phases.length ? workout.color : '#334155'
                }}
              />
            ))}
          </div>
        </div>

        <div className="text-center mb-5">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold"
            style={{ color: anim.colors[phase % anim.phases.length] }}
          >
            {anim.phases[phase % anim.phases.length]}
          </motion.p>
          <p className="text-slate-500 text-sm mt-1">Rep {Math.max(1, rep)} in progress</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {workout.muscles.map(m => (
            <span key={m} className="text-xs px-3 py-1 rounded-full" style={{ background: `${workout.color}20`, color: workout.color }}>
              {m}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {workout.exercises.map((ex, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: workout.color }} />
              {ex}
            </div>
          ))}
        </div>

        <div className="rounded-xl p-3 text-sm text-slate-300" style={{ background: `${workout.color}10`, border: `1px solid ${workout.color}20` }}>
          <span style={{ color: workout.color }}>💡 Pro Tip: </span>{workout.tip}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── BACKGROUND ORBS ─────────────────────────────────────────────────────────

function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="orb"
        style={{ width: 600, height: 600, background: '#3b82f6', top: '-10%', left: '-10%' }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="orb"
        style={{ width: 500, height: 500, background: '#8b5cf6', top: '30%', right: '-8%' }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="orb"
        style={{ width: 400, height: 400, background: '#ec4899', bottom: '-5%', left: '30%' }}
        animate={{ x: [0, 20, 0], y: [0, -25, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ─── FLOATING PARTICLES ──────────────────────────────────────────────────────

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 8,
    duration: Math.random() * 10 + 8,
    color: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)]
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, bottom: '-10px', width: p.size, height: p.size, background: p.color, opacity: 0.4 }}
          animate={{ y: [0, -800], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass rounded-2xl p-5 card-lift"
      style={{ border: `1px solid ${color}25` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ background: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-xs text-slate-500 font-medium">{sub}</span>
      </div>
      <p className="text-2xl font-bold text-white stat-num">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
    </motion.div>
  )
}

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
        <Bot size={14} className="text-white" />
      </div>
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-purple-400 typing-dot" />
        <div className="w-2 h-2 rounded-full bg-purple-400 typing-dot" />
        <div className="w-2 h-2 rounded-full bg-purple-400 typing-dot" />
      </div>
    </div>
  )
}

// ─── DASHBOARD VIEW ───────────────────────────────────────────────────────────

function DashboardView() {
  const [greeting] = useState(() => getGreeting(new Date().getHours()))
  const [greetingEmoji] = useState(() => getGreetingEmoji(new Date().getHours()))

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold gradient-text">{greeting}, Mrinal {greetingEmoji}</h1>
        <p className="text-slate-400 mt-1">Your ForgeOS AI dashboard — everything in one place.</p>
      </motion.div>

      {/* Live Current Activity */}
      <CurrentActivityWidget />

      {/* Stats row with animated count-up */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Calories Burned" value={<CountUp end={2840} />} sub="Today" color="#ef4444" delay={0.1} />
        <StatCard icon={Clock} label="Study Hours" value={<><CountUp end={12} />{'h'}</>} sub="This Week" color="#3b82f6" delay={0.15} />
        <StatCard icon={Award} label="AWS Progress" value={<><CountUp end={65} />{'%'}</>} sub="DevOps Pro" color="#f59e0b" delay={0.2} />
        <StatCard icon={TrendingUp} label="Streak" value={<><CountUp end={14} />{' days'}</>} sub="Active" color="#10b981" delay={0.25} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-blue-400" />
            <h3 className="font-semibold text-white">Weekly Study Hours</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={WEEKLY_STUDY}>
              <defs>
                <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                cursor={{ stroke: '#334155' }}
              />
              <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} fill="url(#studyGrad)" dot={{ fill: '#3b82f6', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-purple-400" />
            <h3 className="font-semibold text-white">Fitness Profile</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <RadarChart data={FITNESS_RADAR}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* DevOps progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Cpu size={16} className="text-amber-400" />
          <h3 className="font-semibold text-white">AWS DevOps Pro — Module Progress</h3>
        </div>
        <div className="space-y-4">
          {DEVOPS_MODULES_DEFAULT.map((m, i) => (
            <motion.div key={m.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.05 }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <m.icon size={14} style={{ color: m.color }} />
                  <span className="text-sm text-slate-300">{m.name}</span>
                </div>
                <span className="text-xs text-slate-500">{m.done}/{m.topics} topics</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.progress}%` }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${m.color}99, ${m.color})` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ─── SCHEDULE VIEW ────────────────────────────────────────────────────────────

function ScheduleView() {
  const [mode, setMode] = useState(() => safeLocalGet('forgeos-shift', 'general'))
  const now = useCurrentTime()
  const schedule = SCHEDULES[mode]

  const setModeAndSave = (m) => {
    setMode(m)
    safeLocalSet('forgeos-shift', m)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold gradient-text">Adaptive Shift Engine</h1>
        <p className="text-slate-400 mt-1">Smart scheduling that adapts to your shift pattern.</p>
      </motion.div>

      {/* Toggle */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {['evening', 'general'].map(m => (
          <button
            key={m}
            onClick={() => setModeAndSave(m)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={mode === m
              ? { background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }
              : { background: 'rgba(30,41,59,0.6)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }
            }
          >
            {m === 'evening' ? '🌙 Evening Shift' : '☀️ General Shift'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent" />
        <div className="space-y-3 stagger">
          {schedule.map((item, i) => {
            const isActive = isCurrentlyActive(item.time, item.end, now)
            return (
              <motion.div
                key={`${mode}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 pl-4 schedule-row rounded-xl p-3 cursor-default"
                style={isActive ? { background: `${item.color}0d`, borderLeft: `3px solid ${item.color}` } : {}}
              >
                {/* Dot */}
                <div
                  className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isActive ? `${item.color}30` : `${item.color}20`,
                    border: `2px solid ${isActive ? item.color : item.color + '60'}`,
                    boxShadow: isActive ? `0 0 12px ${item.color}60` : 'none'
                  }}
                >
                  <item.icon size={14} style={{ color: item.color }} />
                </div>

                <div className="flex-1 glass rounded-xl p-4" style={{ border: `1px solid ${item.color}${isActive ? '30' : '15'}` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{item.label}</p>
                      {isActive && (
                        <motion.span
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: `${item.color}25`, color: item.color }}
                        >
                          ● LIVE
                        </motion.span>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ background: `${item.color}15`, color: item.color }}>
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.time} → {item.end}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Bar chart of time allocation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-purple-400" /> Time Allocation
        </h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={schedule.map(s => ({ name: s.label.split(' ')[0], hours: s.type === 'work' ? 10 : s.type === 'sleep' ? 7 : s.type === 'gym' ? 1.5 : 1, color: s.color }))}>
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {schedule.map((s, i) => (
                <Cell key={i} fill={s.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

// ─── AI COACH VIEW ────────────────────────────────────────────────────────────

function AICoachView() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey Mrinal! 👋 I'm **ForgeOS AI** — your personal coach for AWS, fitness, driving, and productivity. What can I help you crush today?"
    }
  ])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const askAI = useCallback(async () => {
    if (!query.trim() || loading) return
    const userMsg = query.trim()
    setQuery('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check your network and try again.' }])
    } finally {
      setLoading(false)
    }
  }, [query, loading])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAI() }
  }

  const QUICK = ['Plan my AWS study week', 'Best chest workout for mass', 'Highway driving tips', 'Optimize my evening shift']

  return (
    <div className="flex flex-col ai-view-height">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold gradient-text">ForgeOS AI Coach</h1>
        <p className="text-slate-400 mt-1">Powered by Claude — your intelligent life co-pilot.</p>
      </motion.div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
        {QUICK.map(q => (
          <button
            key={q}
            onClick={() => { setQuery(q); textareaRef.current?.focus() }}
            className="text-xs px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-105"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}
          >
            <Sparkles size={10} className="inline mr-1" />{q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 p-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 pulse-glow"
                  style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
                  <Bot size={14} className="text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'rounded-tr-sm text-white' : 'rounded-tl-sm'}`}
                style={msg.role === 'user'
                  ? { background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }
                  : { background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(255,255,255,0.06)' }
                }
              >
                {msg.role === 'assistant' ? (
                  <div className="ai-prose text-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
                  <span className="text-xs font-bold text-white">M</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 mt-4">
        <div className="glass rounded-2xl p-3 gradient-border flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about AWS, fitness, driving, productivity... (Enter to send)"
            rows={2}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none leading-relaxed"
          />
          <motion.button
            onClick={askAI}
            disabled={!query.trim() || loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl flex-shrink-0 transition-all duration-200 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}
          >
            <Send size={16} className="text-white" />
          </motion.button>
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">Shift+Enter for new line · Enter to send</p>
      </div>
    </div>
  )
}

// ─── FITNESS VIEW ─────────────────────────────────────────────────────────────

function FitnessView() {
  const addToast = useToast()
  const [selected, setSelected] = useState(null)
  const [doneToday, setDoneToday] = useState(() => safeLocalGet(`forgeos-workout-${getTodayKey()}`, []))

  const weekLog = Array.from({ length: 7 }, (_, i) => {
    const key = `forgeos-workout-${getDateKey(6 - i)}`
    const done = safeLocalGet(key, [])
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return { day: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()], count: done.length, isToday: i === 6 }
  })

  const logWorkout = (workoutId) => {
    if (doneToday.includes(workoutId)) return
    const updated = [...doneToday, workoutId]
    setDoneToday(updated)
    safeLocalSet(`forgeos-workout-${getTodayKey()}`, updated)
    const w = WORKOUTS.find(w => w.id === workoutId)
    addToast?.(`💪 ${w?.name} logged! +${w?.calories} kcal`, '#10b981')
  }

  const totalCalories = doneToday.reduce((sum, id) => {
    const w = WORKOUTS.find(w => w.id === id)
    return sum + (w?.calories || 0)
  }, 0)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold gradient-text">ForgeOS Fitness</h1>
        <p className="text-slate-400 mt-1">Click any workout to see the exercise animation and demo.</p>
      </motion.div>

      {/* 7-day workout streak */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-4 flex items-center gap-4 flex-wrap"
        style={{ border: '1px solid rgba(16,185,129,0.25)' }}
      >
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-amber-400" />
          <span className="text-sm font-semibold text-white">Weekly Activity</span>
        </div>
        <div className="flex gap-2 flex-1 justify-center">
          {weekLog.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: day.count > 0 ? 'rgba(16,185,129,0.25)' : day.isToday ? 'rgba(139,92,246,0.15)' : 'rgba(30,41,59,0.6)',
                  border: `1px solid ${day.count > 0 ? '#10b98160' : day.isToday ? '#8b5cf640' : 'rgba(255,255,255,0.06)'}`,
                  color: day.count > 0 ? '#10b981' : day.isToday ? '#a78bfa' : '#475569'
                }}
              >
                {day.count > 0 ? '✓' : day.day}
              </div>
              <span className="text-xs text-slate-600">{day.day}</span>
            </div>
          ))}
        </div>
        {doneToday.length > 0 && (
          <div className="text-right">
            <p className="text-sm font-bold" style={{ color: '#10b981' }}>{totalCalories} kcal</p>
            <p className="text-xs text-slate-500">Today</p>
          </div>
        )}
      </motion.div>

      {/* Radar chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white flex items-center gap-2"><Activity size={16} className="text-purple-400" /> Fitness Profile</h3>
          <span className="text-xs text-slate-500">Overall Score: 67/100</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={FITNESS_RADAR}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
            <Radar dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Workout cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {WORKOUTS.map((w, i) => {
          const isDone = doneToday.includes(w.id)
          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className="workout-card glass rounded-2xl p-5 text-left relative overflow-hidden"
              style={{ border: `1px solid ${isDone ? w.color + '60' : w.color + '20'}` }}
            >
              {isDone && (
                <div className="absolute top-2 right-2">
                  <CheckCircle size={16} style={{ color: w.color }} />
                </div>
              )}
              <button
                onClick={() => setSelected(w)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{w.icon}</span>
                  <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ background: `${w.color}15`, color: w.color }}>
                    <Flame size={10} /> {w.calories}
                  </div>
                </div>
                <p className="font-semibold text-white text-sm mb-1">{w.name}</p>
                <p className="text-xs text-slate-500 mb-3">{w.sets} · {w.rest} rest</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {w.muscles.slice(0, 2).map(m => (
                    <span key={m} className="text-xs px-2 py-0.5 rounded-md" style={{ background: `${w.color}10`, color: `${w.color}cc` }}>
                      {m}
                    </span>
                  ))}
                </div>
              </button>

              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setSelected(w)}
                  className="flex items-center gap-1 text-xs flex-1"
                  style={{ color: w.color }}
                >
                  <Play size={10} /> View Demo
                </button>
                <motion.button
                  onClick={() => logWorkout(w.id)}
                  disabled={isDone}
                  whileHover={!isDone ? { scale: 1.05 } : {}}
                  whileTap={!isDone ? { scale: 0.95 } : {}}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
                  style={isDone
                    ? { background: `${w.color}20`, color: w.color, opacity: 0.8 }
                    : { background: `${w.color}15`, color: w.color, border: `1px solid ${w.color}30` }
                  }
                >
                  {isDone ? '✓ Done' : '+ Log'}
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {selected && <ExerciseDemo workout={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}

// ─── DRIVE VIEW ───────────────────────────────────────────────────────────────

function DriveView() {
  const addToast = useToast()
  const [skills, setSkills] = useState(() => safeLocalGet('forgeos-drive-skills', DRIVE_SKILLS_DEFAULT))
  const [active, setActive] = useState(null)

  const adjustSkill = (idx, delta) => {
    setSkills(prev => {
      const updated = prev.map((s, i) => i === idx
        ? { ...s, level: Math.max(0, Math.min(100, s.level + delta)) }
        : s
      )
      safeLocalSet('forgeos-drive-skills', updated)
      const newLevel = Math.max(0, Math.min(100, prev[idx].level + delta))
      addToast?.(`${prev[idx].name} → ${newLevel}%`, prev[idx].color)
      return updated
    })
  }

  const resetSkills = () => {
    setSkills(DRIVE_SKILLS_DEFAULT)
    safeLocalSet('forgeos-drive-skills', DRIVE_SKILLS_DEFAULT)
    addToast?.('Driving skills reset to defaults', '#94a3b8')
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">ForgeOS Drive</h1>
            <p className="text-slate-400 mt-1">Master every driving scenario with guided skill tracking.</p>
          </div>
          <button
            onClick={resetSkills}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-300 transition-all mt-1"
            style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </motion.div>

      {/* Skill bars */}
      <div className="space-y-4">
        {skills.map((skill, i) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-5 cursor-pointer card-lift"
            style={{ border: `1px solid ${active === i ? skill.color + '50' : 'rgba(255,255,255,0.05)'}` }}
            onClick={() => setActive(active === i ? null : i)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{skill.icon}</span>
                <div>
                  <p className="font-semibold text-white">{skill.name}</p>
                  <p className="text-xs text-slate-500">Skill Level</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold" style={{ color: skill.color }}>{skill.level}%</span>
                <ChevronDown
                  size={16}
                  className="text-slate-500 transition-transform duration-200"
                  style={{ transform: active === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${skill.level}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${skill.color}80, ${skill.color})` }}
              />
            </div>

            {/* Expanded tip + controls */}
            <AnimatePresence>
              {active === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-xl p-3 text-sm text-slate-300 mb-3"
                    style={{ background: `${skill.color}10`, border: `1px solid ${skill.color}20` }}>
                    <span style={{ color: skill.color }}>💡 Tip: </span>{skill.tip}
                  </div>
                  {/* Level adjuster */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Adjust skill level:</span>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); adjustSkill(i, -5) }}
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
                      >
                        <Minus size={13} />
                      </motion.button>
                      <span className="text-sm font-bold w-12 text-center" style={{ color: skill.color }}>{skill.level}%</span>
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); adjustSkill(i, 5) }}
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: `${skill.color}15`, border: `1px solid ${skill.color}30`, color: skill.color }}
                      >
                        <Plus size={13} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Overall driving score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-amber-400" /> Skill Comparison
        </h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={skills} layout="vertical">
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
            <Bar dataKey="level" radius={[0, 4, 4, 0]}>
              {skills.map((s, i) => (
                <Cell key={i} fill={s.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

// ─── DEVOPS VIEW ──────────────────────────────────────────────────────────────

function DevOpsView() {
  const addToast = useToast()
  const [modules, setModules] = useState(() => safeLocalGet('forgeos-devops', DEVOPS_MODULES_DEFAULT))

  const markTopicDone = (idx) => {
    setModules(prev => {
      const m = prev[idx]
      if (m.done >= m.topics) {
        addToast?.(`${m.name} is already complete! 🎉`, m.color)
        return prev
      }
      const done = m.done + 1
      const progress = Math.round((done / m.topics) * 100)
      const updated = prev.map((item, i) => i === idx ? { ...item, done, progress } : item)
      safeLocalSet('forgeos-devops', updated)
      if (done === m.topics) {
        addToast?.(`🏆 ${m.name} COMPLETE!`, m.color)
      } else {
        addToast?.(`✅ ${m.name}: ${done}/${m.topics} topics`, m.color)
      }
      return updated
    })
  }

  const resetModules = () => {
    setModules(DEVOPS_MODULES_DEFAULT)
    safeLocalSet('forgeos-devops', DEVOPS_MODULES_DEFAULT)
    addToast?.('DevOps modules reset', '#94a3b8')
  }

  const totalDone = modules.reduce((s, m) => s + m.done, 0)
  const totalTopics = modules.reduce((s, m) => s + m.topics, 0)
  const overallProgress = Math.round((totalDone / totalTopics) * 100)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">ForgeOS DevOps</h1>
            <p className="text-slate-400 mt-1">AWS DevOps Pro certification tracker and study planner.</p>
          </div>
          <button
            onClick={resetModules}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-300 transition-all mt-1"
            style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Target} label="Overall Progress" value={<><CountUp end={overallProgress} suffix="%" /></>} sub="DevOps Pro" color="#f59e0b" delay={0.1} />
        <StatCard icon={BookOpen} label="Topics Done" value={<>{totalDone}/{totalTopics}</>} sub="Modules" color="#3b82f6" delay={0.15} />
        <StatCard icon={Award} label="Mock Score" value="74%" sub="Last Test" color="#10b981" delay={0.2} />
      </div>

      {/* Module cards */}
      <div className="grid lg:grid-cols-2 gap-4">
        {modules.map((m, i) => {
          const isComplete = m.done >= m.topics
          return (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
              className="glass rounded-2xl p-5 card-lift"
              style={{ border: `1px solid ${isComplete ? m.color + '50' : m.color + '20'}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl" style={{ background: `${m.color}20` }}>
                  <m.icon size={18} style={{ color: m.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{m.name}</p>
                    {isComplete && <span className="text-xs px-1.5 py-0.5 rounded-md font-bold" style={{ background: `${m.color}20`, color: m.color }}>✓ Done</span>}
                  </div>
                  <p className="text-xs text-slate-500">{m.done} of {m.topics} topics completed</p>
                </div>
                <span className="text-lg font-bold" style={{ color: m.color }}>{m.progress}%</span>
              </div>

              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                <motion.div
                  animate={{ width: `${m.progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${m.color}70, ${m.color})` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{m.topics - m.done} topics remaining</span>
                <motion.button
                  onClick={() => markTopicDone(i)}
                  disabled={isComplete}
                  whileHover={!isComplete ? { scale: 1.05 } : {}}
                  whileTap={!isComplete ? { scale: 0.95 } : {}}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all text-xs"
                  style={isComplete
                    ? { background: `${m.color}15`, color: m.color, opacity: 0.7 }
                    : { background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}30` }
                  }
                >
                  {isComplete ? '🏆 Complete' : <><Plus size={10} /> Mark Done</>}
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Weekly study chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-400" /> Study Hours This Week
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={WEEKLY_STUDY}>
            <defs>
              <linearGradient id="devopsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
            <Area type="monotone" dataKey="hours" stroke="#f59e0b" strokeWidth={2} fill="url(#devopsGrad)" dot={{ fill: '#f59e0b', r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('forgeos-theme')
    if (saved === 'light') setDarkMode(false)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('forgeos-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const addToast = useCallback((msg, color) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, color }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  // Keyboard navigation: 1-6 keys switch views
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return
      const idx = parseInt(e.key) - 1
      if (idx >= 0 && idx < NAV_ITEMS.length) setActiveNav(NAV_ITEMS[idx].id)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const views = {
    dashboard: <DashboardView />,
    schedule: <ScheduleView />,
    ai: <AICoachView />,
    fitness: <FitnessView />,
    drive: <DriveView />,
    devops: <DevOpsView />,
  }

  return (
    <ToastContext.Provider value={addToast}>
      <div data-theme={darkMode ? 'dark' : 'light'} className="min-h-screen relative" style={{ background: 'var(--bg-primary)', transition: 'background 0.3s ease' }}>
        <BackgroundOrbs />
        <FloatingParticles />
        <ToastContainer toasts={toasts} />

        <div className="relative z-10 flex min-h-screen">

          {/* ── Sidebar ── */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="glass flex-shrink-0 hidden md:flex flex-col"
            style={{
              width: sidebarOpen ? '240px' : '72px',
              transition: 'width 0.3s ease',
              borderRight: '1px solid var(--border-subtle)',
              minHeight: '100vh',
              position: 'sticky',
              top: 0,
              height: '100vh',
              overflow: 'hidden'
            }}
          >
            {/* Logo */}
            <div className="p-5 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 pulse-glow"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899)' }}>
                <Zap size={18} className="text-white" />
              </div>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                  <p className="font-bold text-white text-sm leading-tight">ForgeOS AI</p>
                  <p className="text-xs text-slate-500">Life Operating System</p>
                </motion.div>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${activeNav === item.id ? 'active' : ''}`}
                >
                  <item.icon
                    size={18}
                    className="flex-shrink-0"
                    style={{ color: activeNav === item.id ? '#a78bfa' : '#64748b' }}
                  />
                  {sidebarOpen && (
                    <span style={{ color: activeNav === item.id ? '#e2e8f0' : '#64748b' }}>
                      {item.label}
                    </span>
                  )}
                  {sidebarOpen && activeNav === item.id && (
                    <motion.div layoutId="activeIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
                  )}
                  {sidebarOpen && (
                    <span className="ml-auto text-xs text-slate-600 font-mono">{idx + 1}</span>
                  )}
                </button>
              ))}
            </nav>

            {/* Keyboard hint */}
            {sidebarOpen && (
              <div className="px-4 pb-2 flex-shrink-0">
                <p className="text-xs text-slate-600 text-center">Press 1–6 to switch views</p>
              </div>
            )}

            {/* Collapse toggle */}
            <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all text-xs"
              >
                <RotateCcw size={14} />
                {sidebarOpen && 'Collapse'}
              </button>
            </div>
          </motion.aside>

          {/* ── Main content ── */}
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {/* Top bar */}
            <div className="sticky top-0 z-20 glass px-4 py-3 md:px-6 md:py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                {/* Mobile: show logo */}
                <div className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 pulse-glow"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899)' }}>
                  <Zap size={15} className="text-white" />
                </div>
                <div className="hidden md:flex w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px #10b981' }} />
                <span className="text-sm font-semibold md:font-normal text-slate-300 md:text-slate-400">
                  {NAV_ITEMS.find(n => n.id === activeNav)?.label}
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                {/* Live clock */}
                <LiveClock />
                {/* Dark / Light Mode Toggle */}
                <button
                  onClick={() => setDarkMode(d => !d)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                  style={{
                    background: darkMode ? 'rgba(139,92,246,0.15)' : 'rgba(251,191,36,0.15)',
                    border: `1px solid ${darkMode ? 'rgba(139,92,246,0.35)' : 'rgba(251,191,36,0.4)'}`,
                  }}
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode
                    ? <Moon size={14} className="text-purple-400" />
                    : <Sun size={14} className="text-amber-400" />
                  }
                </button>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
                  M
                </div>
              </div>
            </div>

            {/* Page content */}
            <div className="p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNav}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  {views[activeNav]}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* ── Mobile Bottom Navigation ── */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden mobile-nav glass"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all duration-200"
            >
              <item.icon
                size={19}
                style={{ color: activeNav === item.id ? '#a78bfa' : 'var(--text-muted)' }}
              />
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: activeNav === item.id ? 600 : 400,
                  color: activeNav === item.id ? '#a78bfa' : 'var(--text-muted)',
                }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </ToastContext.Provider>
  )
}
