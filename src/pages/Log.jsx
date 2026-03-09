import { useState, useEffect } from 'react'

function todayKey() {
  return new Date().toISOString().split('T')[0]
}
function getLog(k) {
  try { return JSON.parse(localStorage.getItem(`log_${k}`) || '[]') } catch { return [] }
}

export default function Log() {
  const [entries, setEntries] = useState([])
  const [goal, setGoal] = useState(() => parseInt(localStorage.getItem('calorie_goal') || '0'))
  const [goalInput, setGoalInput] = useState(() => localStorage.getItem('calorie_goal') || '')
  const dateKey = todayKey()

  useEffect(() => {
    setEntries(getLog(dateKey))
  }, [])

  function refresh() { setEntries(getLog(dateKey)) }

  function deleteEntry(id) {
    const updated = entries.filter(e => e.id !== id)
    localStorage.setItem(`log_${dateKey}`, JSON.stringify(updated))
    setEntries(updated)
  }

  function clearToday() {
    if (!confirm('Clear all of today\'s log?')) return
    localStorage.removeItem(`log_${dateKey}`)
    setEntries([])
  }

  function saveGoal() {
    const val = parseInt(goalInput)
    if (val > 0) {
      localStorage.setItem('calorie_goal', val)
      setGoal(val)
    }
  }

  const totals = entries.reduce((acc, e) => ({
    calories: acc.calories + (e.calories || 0),
    protein:  acc.protein  + (e.protein  || 0),
    carbs:    acc.carbs    + (e.carbs    || 0),
    fat:      acc.fat      + (e.fat      || 0),
    fiber:    acc.fiber    + (e.fiber    || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })

  const pct = goal > 0 ? Math.min(Math.round((totals.calories / goal) * 100), 100) : 0
  const over = goal > 0 && totals.calories > goal
  const remaining = goal - totals.calories

  const now = new Date()
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  // Past days
  const pastKeys = Object.keys(localStorage)
    .filter(k => k.startsWith('log_') && k !== `log_${dateKey}`)
    .sort().reverse().slice(0, 7)

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Today — {days[now.getDay()]}</div>
          <div style={{ fontSize: 12, color: '#555', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>
            {months[now.getMonth()]} {now.getDate()}, {now.getFullYear()}
          </div>
        </div>
        <button onClick={clearToday} style={{ padding: '8px 14px', background: 'rgba(255,50,50,0.08)', border: '1px solid rgba(255,50,50,0.2)', borderRadius: 10, color: '#ff6b6b', fontFamily: 'DM Mono, monospace', fontSize: 11, cursor: 'pointer' }}>
          Clear Day
        </button>
      </div>

      {/* Goal */}
      <div className="card">
        <div className="card-title">Daily Calorie Goal</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#888', fontFamily: 'DM Mono, monospace' }}>
            {goal > 0 ? `${totals.calories} / ${goal} kcal` : `${totals.calories} kcal today`}
          </span>
          {goal > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: '#ff6b35', fontFamily: 'DM Mono, monospace' }}>{pct}%</span>}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: over ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#ff6b35,#f7931e)', transition: 'width 0.8s ease' }} />
        </div>
        {goal > 0 && (
          <div style={{ fontSize: 12, color: over ? '#ef4444' : '#555', fontFamily: 'DM Mono, monospace', marginBottom: 12 }}>
            {over ? `${Math.abs(remaining)} kcal over goal 🔴` : `${remaining} kcal remaining`}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            placeholder="Set daily goal (e.g. 1800)"
            style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a3a', borderRadius: 10, color: '#fff', fontFamily: 'DM Mono, monospace', fontSize: 13, outline: 'none' }}
          />
          <button onClick={saveGoal} style={{ padding: '10px 16px', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 10, color: '#ff6b35', cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
            Save
          </button>
        </div>
      </div>

      {/* Totals grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div style={{ gridColumn: '1/-1', background: 'linear-gradient(135deg,rgba(255,107,53,0.12),rgba(247,147,30,0.06))', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 800, background: 'linear-gradient(135deg,#ff6b35,#f7931e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{totals.calories}</div>
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Total Calories</div>
        </div>
        {[['Protein', totals.protein, '#4ade80'], ['Carbs', totals.carbs, '#60a5fa'], ['Fat', totals.fat, '#facc15'], ['Fiber', totals.fiber, '#a78bfa']].map(([label, val, color]) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: 16, marginBottom: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{val}g</div>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Entries */}
      <div className="field-label">Meals Today</div>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#333', fontFamily: 'DM Mono, monospace', fontSize: 13, lineHeight: 2 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🍽</div>
          No meals logged yet.<br />Scan a food on the Scanner tab<br />and tap "Add to Today's Log"!
        </div>
      ) : (
        entries.map(e => (
          <div key={e.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e1e2e', borderRadius: 16, padding: 16, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 32, flexShrink: 0 }}>{e.emoji || '🍽'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.foodName}</div>
              <div style={{ fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace', marginTop: 3 }}>P: {e.protein}g · C: {e.carbs}g · F: {e.fat}g</div>
              <div style={{ fontSize: 11, color: '#333', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>{e.time} · {e.servingSize}</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ff6b35', flexShrink: 0 }}>{e.calories}</div>
            <button onClick={() => deleteEntry(e.id)} style={{ background: 'none', border: 'none', color: '#333', fontSize: 16, cursor: 'pointer', padding: 4, flexShrink: 0 }}>🗑</button>
          </div>
        ))
      )}

      {/* History */}
      {pastKeys.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="field-label">Past Days</div>
          {pastKeys.map(k => {
            const dk = k.replace('log_', '')
            const dayEntries = getLog(dk)
            const dayCals = dayEntries.reduce((s, e) => s + e.calories, 0)
            return (
              <div key={k} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', fontFamily: 'DM Mono, monospace', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #1e1e2e' }}>
                  <span>{dk} ({dayEntries.length} meals)</span>
                  <span style={{ color: '#ff6b35', fontWeight: 600 }}>{dayCals} kcal</span>
                </div>
                {dayEntries.map(e => (
                  <div key={e.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a2a', borderRadius: 12, padding: '10px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{e.emoji || '🍽'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{e.foodName}</div>
                      <div style={{ fontSize: 11, color: '#333', fontFamily: 'DM Mono, monospace' }}>{e.time}</div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#ff6b35' }}>{e.calories}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
