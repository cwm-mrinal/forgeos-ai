
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Home(){

const [mode,setMode] = useState('evening')
const [answer,setAnswer] = useState('Ask ForgeOS AI anything...')
const [query,setQuery] = useState('')

const evening = [
'2 AM - 9 AM Sleep',
'9:45 AM - 11:15 AM Gym',
'12:15 PM - 1 PM AWS Study',
'1:30 PM Leave for Office',
'3 PM - 1 AM Office Shift'
]

const general = [
'11:30 PM - 6:30 AM Sleep',
'7 AM - 8:30 AM Gym',
'9 AM Leave for Office',
'10 AM - 7 PM Office Shift',
'9 PM AWS Study'
]

const askAI = async () => {

 try{

 const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/chat',{
 method:'POST',
 headers:{'Content-Type':'application/json'},
 body:JSON.stringify({query})
 })

 const data = await res.json()

 setAnswer(data.response)

 }catch{
 setAnswer('ForgeOS AI backend error')
 }

}

return(
<main className="min-h-screen p-6 bg-slate-950">

<div className="max-w-7xl mx-auto">

<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="rounded-[40px] p-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl">

<h1 className="text-6xl font-bold">
ForgeOS AI
</h1>

<p className="mt-5 text-xl">
Elite AI Life Operating System
</p>

</motion.div>

<div className="grid lg:grid-cols-2 gap-8 mt-10">

<div className="bg-slate-900 p-8 rounded-3xl">

<h2 className="text-3xl font-bold">
Adaptive Shift Engine
</h2>

<div className="flex gap-4 mt-5">
<button onClick={()=>setMode('evening')} className="bg-blue-600 px-5 py-3 rounded-2xl">
Evening Shift
</button>

<button onClick={()=>setMode('general')} className="bg-emerald-600 px-5 py-3 rounded-2xl">
General Shift
</button>
</div>

<div className="mt-6 grid gap-4">

{(mode === 'evening' ? evening : general).map((item,index)=>(
<div key={index} className="bg-slate-800 p-4 rounded-2xl">
{item}
</div>
))}

</div>

</div>

<div className="bg-slate-900 p-8 rounded-3xl">

<h2 className="text-3xl font-bold">
ForgeOS AI Coach
</h2>

<textarea
value={query}
onChange={(e)=>setQuery(e.target.value)}
placeholder="Ask about AWS, fitness, driving, productivity..."
className="w-full h-40 bg-slate-800 rounded-2xl p-4 mt-5"
/>

<button onClick={askAI} className="mt-5 bg-purple-600 px-6 py-3 rounded-2xl">
Ask ForgeOS AI
</button>

<div className="bg-slate-800 p-5 rounded-2xl mt-6 min-h-[220px]">
{answer}
</div>

</div>

</div>

<div className="grid lg:grid-cols-3 gap-6 mt-10">

<div className="bg-slate-900 p-6 rounded-3xl">
<h2 className="text-3xl font-bold">ForgeOS Fitness</h2>

<ul className="mt-5 space-y-3 text-slate-300">
<li>Chest + Triceps</li>
<li>Back + Biceps</li>
<li>Shoulders + Abs</li>
<li>Legs</li>
<li>Fat Loss HIIT</li>
<li>Mobility Recovery</li>
</ul>
</div>

<div className="bg-slate-900 p-6 rounded-3xl">
<h2 className="text-3xl font-bold">ForgeOS Drive</h2>

<ul className="mt-5 space-y-3 text-slate-300">
<li>Traffic Driving</li>
<li>Highway Driving</li>
<li>Reverse Parking</li>
<li>Clutch Control</li>
<li>City Traffic</li>
</ul>
</div>

<div className="bg-slate-900 p-6 rounded-3xl">
<h2 className="text-3xl font-bold">ForgeOS DevOps</h2>

<ul className="mt-5 space-y-3 text-slate-300">
<li>AWS DevOps Pro</li>
<li>Mock Tests</li>
<li>Labs Tracker</li>
<li>Study Analytics</li>
<li>AI Study Planner</li>
</ul>
</div>

</div>

</div>

</main>
)
}
