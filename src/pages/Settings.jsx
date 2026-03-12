import { useUser, useClerk } from '@clerk/clerk-react'
import { useState } from 'react'
import { useUserContext } from '../context/UserContext'

export default function Settings() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { isPremium, openBillingPortal } = useUserContext()
  const [cleared, setCleared] = useState(false)
  const [reminderTimes, setReminderTimes] = useState({ breakfast: '08:00', lunch: '12:30', dinner: '18:30' })
  const [remindersEnabled, setRemindersEnabled] = useState(false)

  async function requestNotifications() {
    if (!('Notification' in window)) { alert('Notifications not supported on this device.'); return }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setRemindersEnabled(true)
      new Notification('EZ Calorie', { body: '🍔 Reminders enabled! We\'ll remind you to log your meals.', icon: '/favicon.ico' })
    } else {
      alert('Please allow notifications in your browser settings.')
    }
  }

  function clearKey() { localStorage.removeItem('gkey'); localStorage.removeItem('gmodel'); window.location.reload() }

  return (
    <div className="page">
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:12, letterSpacing:'0.3em', color:'#ff6b35', textTransform:'uppercase', fontFamily:'DM Mono, monospace', marginBottom:10 }}>Account</div>
        <h1 style={{ fontSize:'clamp(1.8rem,8vw,2.6rem)', fontWeight:800, lineHeight:1.05, letterSpacing:'-0.03em' }}><span className="grad">Settings</span></h1>
      </div>

      {/* Profile */}
      <div className="card">
        <div className="card-title">Your Account</div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <img src={user?.imageUrl} alt="avatar" style={{ width:52, height:52, borderRadius:'50%', border:'2px solid #ff6b35' }} />
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>{user?.fullName || 'User'}</div>
            <div style={{ fontSize:12, color:'#555', fontFamily:'DM Mono, monospace', marginTop:2 }}>{user?.primaryEmailAddress?.emailAddress}</div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="card">
        <div className="card-title">Subscription</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>EZ Calorie Premium</div>
            <div style={{ fontSize:12, color:'#555', fontFamily:'DM Mono, monospace', marginTop:2 }}>
              {isPremium ? '$4.99 / month' : 'Free plan'}
            </div>
          </div>
          <div style={{ padding:'6px 12px', background:isPremium?'rgba(74,222,128,0.1)':'rgba(255,107,53,0.1)', border:`1px solid ${isPremium?'rgba(74,222,128,0.3)':'rgba(255,107,53,0.3)'}`, borderRadius:99, fontSize:11, color:isPremium?'#4ade80':'#ff6b35', fontFamily:'DM Mono, monospace' }}>
            {isPremium ? '✓ PREMIUM' : 'FREE'}
          </div>
        </div>
        {isPremium ? (
          <button onClick={openBillingPortal} className="btn-ghost" style={{ margin:0, fontSize:13 }}>
            💳 Manage Subscription
          </button>
        ) : (
          <>
            <p style={{ fontSize:12, color:'#555', fontFamily:'DM Mono, monospace', lineHeight:1.7, marginBottom:12 }}>
              Upgrade to unlock the daily food log, goal tracker, weekly charts and meal reminders.
            </p>
            <button className="btn-main" onClick={() => window.location.href = '/?tab=log'} style={{ fontSize:15 }}>
              🚀 Start 7-Day Free Trial — $4.99/mo
            </button>
          </>
        )}
      </div>

      {/* Reminders */}
      <div className="card">
        <div className="card-title">Meal Reminders 🔔</div>
        {!isPremium ? (
          <p style={{ fontSize:13, color:'#555', fontFamily:'DM Mono, monospace', lineHeight:1.7 }}>Meal reminders are a Premium feature.</p>
        ) : (
          <>
            <p style={{ fontSize:13, color:'#888', fontFamily:'DM Mono, monospace', lineHeight:1.7, marginBottom:16 }}>
              Get reminded to log your meals each day.
            </p>
            {['breakfast','lunch','dinner'].map(meal => (
              <div key={meal} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ fontSize:14, color:'#ccc', textTransform:'capitalize' }}>{meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'} {meal}</span>
                <input type="time" value={reminderTimes[meal]} onChange={e=>setReminderTimes(p=>({...p,[meal]:e.target.value}))}
                  style={{ padding:'8px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid #2a2a3a', borderRadius:8, color:'#fff', fontFamily:'DM Mono, monospace', fontSize:13, outline:'none' }} />
              </div>
            ))}
            <button className="btn-green" onClick={requestNotifications} style={{ marginTop:8 }}>
              {remindersEnabled ? '✓ Reminders Enabled' : '🔔 Enable Reminders'}
            </button>
          </>
        )}
      </div>

      {/* API Key */}
      <div className="card">
        <div className="card-title">Gemini API Key</div>
        <p style={{ fontSize:13, color:'#555', fontFamily:'DM Mono, monospace', lineHeight:1.7, marginBottom:12 }}>
          {localStorage.getItem('gmodel') ? `✓ Using ${localStorage.getItem('gmodel')}` : 'No key saved. Go to Scanner tab to set one.'}
        </p>
        <button onClick={clearKey} className="btn-ghost" style={{ margin:0, fontSize:13 }}>🔄 Reset API Key</button>
      </div>

      {/* Sign out */}
      <button className="btn-ghost" onClick={() => signOut()} style={{ marginTop:6 }}>Sign Out</button>

      <div style={{ textAlign:'center', marginTop:24, color:'#2a2a3a', fontFamily:'DM Mono, monospace', fontSize:11 }}>
        EZ Calorie Premium v2.0 · Phase 3
      </div>
    </div>
  )
}
