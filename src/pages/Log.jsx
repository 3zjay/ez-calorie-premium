import { useState, useEffect, useCallback } from 'react'
import { useUserContext } from '../context/UserContext'
import { useLog } from '../context/LogContext'
import Paywall from '../components/Paywall'

function todayKey() { return new Date().toISOString().split('T')[0] }

export default function Log() {
  const { isPremium, calorieGoal, updateGoal, loading } = useUserContext()
  const { getLog, clearDay, deleteEntry } = useLog()
  const [entries, setEntries] = useState([])
  const [goalInput, setGoalInput] = useState('')
  const [fetching, setFetching] = useState(false)
  const dateKey = todayKey()

  const load = useCallback(async () => {
    if (!isPremium) return
    setFetching(true)
    try {
      const data = await getLog(dateKey)
      // Normalize field names from snake_case (DB) to camelCase
      setEntries(data.map(e => ({
        id: e.id,
        emoji: e.emoji,
        foodName: e.food_name,
        calories: e.calories,
        protein: e.protein,
        carbs: e.carbs,
        fat: e.fat,
        fiber: e.fiber,
        servingSize: e.serving_size,
        time: e.time_label,
      })))
    } catch(e) { console.error(e) }
    setFetching(false)
  }, [isPremium, dateKey])

  useEffect(() => { load() }, [load])
  useEffect(() => { setGoalInput(calorieGoal > 0 ? String(calorieGoal) : '') }, [calorieGoal])

  if (loading) return <div className="page" style={{ textAlign:'center', paddingTop:80 }}><span className="spin" style={{ fontSize:32 }}>⟳</span></div>
  if (!isPremium) return <Paywall feature="Daily Food Log" />

  const totals = entries.reduce((a,e) => ({ calories:a.calories+e.calories, protein:a.protein+e.protein, carbs:a.carbs+e.carbs, fat:a.fat+e.fat, fiber:a.fiber+e.fiber }), { calories:0, protein:0, carbs:0, fat:0, fiber:0 })
  const goal = calorieGoal || 0
  const pct = goal > 0 ? Math.min(Math.round((totals.calories/goal)*100),100) : 0
  const over = goal > 0 && totals.calories > goal

  const now = new Date()
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  async function handleDelete(id) {
    await deleteEntry(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  async function handleClear() {
    if (!confirm("Clear today's log?")) return
    await clearDay(dateKey)
    setEntries([])
  }

  async function handleGoalSave() {
    const val = parseInt(goalInput)
    if (val > 0) await updateGoal(val)
  }

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800 }}>Today — {days[now.getDay()]}</div>
          <div style={{ fontSize:12, color:'#555', fontFamily:'DM Mono, monospace', marginTop:2 }}>{months[now.getMonth()]} {now.getDate()}, {now.getFullYear()}</div>
        </div>
        <button onClick={handleClear} style={{ padding:'8px 14px', background:'rgba(255,50,50,0.08)', border:'1px solid rgba(255,50,50,0.2)', borderRadius:10, color:'#ff6b6b', fontFamily:'DM Mono, monospace', fontSize:11, cursor:'pointer' }}>Clear Day</button>
      </div>

      {/* Goal */}
      <div className="card">
        <div className="card-title">Daily Calorie Goal</div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:13, color:'#888', fontFamily:'DM Mono, monospace' }}>{goal>0?`${totals.calories} / ${goal} kcal`:`${totals.calories} kcal today`}</span>
          {goal>0 && <span style={{ fontSize:13, fontWeight:600, color:'#ff6b35', fontFamily:'DM Mono, monospace' }}>{pct}%</span>}
        </div>
        <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:99, height:8, overflow:'hidden', marginBottom:8 }}>
          <div style={{ width:`${pct}%`, height:'100%', borderRadius:99, background:over?'linear-gradient(90deg,#ef4444,#dc2626)':'linear-gradient(90deg,#ff6b35,#f7931e)', transition:'width 0.8s ease' }} />
        </div>
        {goal>0 && <div style={{ fontSize:12, color:over?'#ef4444':'#555', fontFamily:'DM Mono, monospace', marginBottom:12 }}>
          {over?`${Math.abs(goal-totals.calories)} kcal over goal 🔴`:`${goal-totals.calories} kcal remaining`}
        </div>}
        <div style={{ display:'flex', gap:8 }}>
          <input type="number" value={goalInput} onChange={e=>setGoalInput(e.target.value)} placeholder="Set daily goal (e.g. 1800)"
            style={{ flex:1, padding:'10px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid #2a2a3a', borderRadius:10, color:'#fff', fontFamily:'DM Mono, monospace', fontSize:13, outline:'none' }} />
          <button onClick={handleGoalSave} style={{ padding:'10px 16px', background:'rgba(255,107,53,0.15)', border:'1px solid rgba(255,107,53,0.3)', borderRadius:10, color:'#ff6b35', cursor:'pointer', fontFamily:'DM Mono, monospace', fontSize:12 }}>Save</button>
        </div>
      </div>

      {/* Totals */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        <div style={{ gridColumn:'1/-1', background:'linear-gradient(135deg,rgba(255,107,53,0.12),rgba(247,147,30,0.06))', border:'1px solid rgba(255,107,53,0.2)', borderRadius:16, padding:16, textAlign:'center' }}>
          <div style={{ fontSize:48, fontWeight:800, background:'linear-gradient(135deg,#ff6b35,#f7931e)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1 }}>{totals.calories}</div>
          <div style={{ fontSize:11, color:'#555', fontFamily:'DM Mono, monospace', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>Total Calories</div>
        </div>
        {[['Protein',totals.protein,'#4ade80'],['Carbs',totals.carbs,'#60a5fa'],['Fat',totals.fat,'#facc15'],['Fiber',totals.fiber,'#a78bfa']].map(([label,val,color])=>(
          <div key={label} className="card" style={{ textAlign:'center', padding:16, marginBottom:0 }}>
            <div style={{ fontSize:22, fontWeight:800, color }}>{val}g</div>
            <div style={{ fontSize:11, color:'#555', fontFamily:'DM Mono, monospace', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Entries */}
      <div className="field-label">Meals Today</div>
      {fetching ? (
        <div style={{ textAlign:'center', padding:40 }}><span className="spin">⟳</span></div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign:'center', padding:'50px 20px', color:'#333', fontFamily:'DM Mono, monospace', fontSize:13, lineHeight:2 }}>
          <div style={{ fontSize:44, marginBottom:12 }}>🍽</div>
          No meals logged yet.<br />Scan a food and tap<br />"Add to Log (Cloud)"!
        </div>
      ) : entries.map(e => (
        <div key={e.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid #1e1e2e', borderRadius:16, padding:16, marginBottom:10, display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ fontSize:32, flexShrink:0 }}>{e.emoji||'🍽'}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:15, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{e.foodName}</div>
            <div style={{ fontSize:11, color:'#555', fontFamily:'DM Mono, monospace', marginTop:3 }}>P:{e.protein}g · C:{e.carbs}g · F:{e.fat}g</div>
            <div style={{ fontSize:11, color:'#333', fontFamily:'DM Mono, monospace', marginTop:2 }}>{e.time} · {e.servingSize}</div>
          </div>
          <div style={{ fontSize:18, fontWeight:800, color:'#ff6b35', flexShrink:0 }}>{e.calories}</div>
          <button onClick={()=>handleDelete(e.id)} style={{ background:'none', border:'none', color:'#333', fontSize:16, cursor:'pointer', padding:4, flexShrink:0 }}>🗑</button>
        </div>
      ))}

      {/* Cloud badge */}
      <div style={{ textAlign:'center', marginTop:16, fontSize:11, color:'#2a2a3a', fontFamily:'DM Mono, monospace' }}>
        ☁️ synced to cloud · accessible on any device
      </div>
    </div>
  )
}
