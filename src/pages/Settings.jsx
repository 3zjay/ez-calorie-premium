import { useUser, useClerk } from '@clerk/clerk-react'
import { useState } from 'react'

export default function Settings() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [cleared, setCleared] = useState(false)

  function clearAllData() {
    if (!confirm('Delete ALL your food logs and settings? This cannot be undone.')) return
    const keep = ['gkey', 'gmodel', 'calorie_goal']
    Object.keys(localStorage).forEach(k => {
      if (!keep.includes(k)) localStorage.removeItem(k)
    })
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  function clearKey() {
    localStorage.removeItem('gkey')
    localStorage.removeItem('gmodel')
    window.location.reload()
  }

  return (
    <div className="page">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.3em', color: '#ff6b35', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>
          Account
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem,8vw,2.6rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
          <span className="grad">Settings</span>
        </h1>
      </div>

      {/* Profile */}
      <div className="card">
        <div className="card-title">Your Account</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={user?.imageUrl}
            alt="avatar"
            style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #ff6b35' }}
          />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{user?.fullName || 'User'}</div>
            <div style={{ fontSize: 12, color: '#555', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>
              {user?.primaryEmailAddress?.emailAddress}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="card">
        <div className="card-title">Subscription</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>EZ Calorie Premium</div>
            <div style={{ fontSize: 12, color: '#555', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>Active — 7-day trial</div>
          </div>
          <div style={{ padding: '6px 12px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 99, fontSize: 11, color: '#4ade80', fontFamily: 'DM Mono, monospace' }}>
            ACTIVE
          </div>
        </div>
        <div style={{ background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.15)', borderRadius: 12, padding: 12 }}>
          <p style={{ fontSize: 12, color: '#888', fontFamily: 'DM Mono, monospace', lineHeight: 1.7 }}>
            💳 Stripe billing coming soon.<br />
            You are on a free trial with full access to all features.
          </p>
        </div>
      </div>

      {/* Reminders */}
      <div className="card">
        <div className="card-title">Meal Reminders 🔔</div>
        <p style={{ fontSize: 13, color: '#555', fontFamily: 'DM Mono, monospace', lineHeight: 1.7, marginBottom: 12 }}>
          Push notification reminders are coming in the next update. You'll be able to set breakfast, lunch and dinner reminders that work even when the app is closed.
        </p>
        <div style={{ padding: '10px 14px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 10, fontSize: 12, color: '#60a5fa', fontFamily: 'DM Mono, monospace' }}>
          🗓 Coming soon — Phase 3
        </div>
      </div>

      {/* API Key */}
      <div className="card">
        <div className="card-title">Gemini API Key</div>
        <p style={{ fontSize: 13, color: '#555', fontFamily: 'DM Mono, monospace', lineHeight: 1.7, marginBottom: 12 }}>
          {localStorage.getItem('gmodel') ? `✓ Key verified — using ${localStorage.getItem('gmodel')}` : 'No key saved. Go to the Scanner tab to set one.'}
        </p>
        <button onClick={clearKey} className="btn-ghost" style={{ margin: 0, fontSize: 13 }}>
          🔄 Reset API Key
        </button>
      </div>

      {/* Data */}
      <div className="card">
        <div className="card-title">Your Data</div>
        <p style={{ fontSize: 13, color: '#555', fontFamily: 'DM Mono, monospace', lineHeight: 1.7, marginBottom: 12 }}>
          All food logs are currently stored in this browser only. Cloud sync is coming in a future update.
        </p>
        {cleared && <div className="ibox ok">All log data cleared.</div>}
        <button onClick={clearAllData} style={{ width: '100%', padding: 12, background: 'rgba(255,50,50,0.06)', border: '1px solid rgba(255,50,50,0.2)', borderRadius: 12, color: '#ff6b6b', cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>
          🗑 Clear All Food Logs
        </button>
      </div>

      {/* Sign out */}
      <button className="btn-ghost" onClick={() => signOut()} style={{ marginTop: 6 }}>
        Sign Out
      </button>

      <div style={{ textAlign: 'center', marginTop: 24, color: '#2a2a3a', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
        EZ Calorie Premium v1.0<br />
        Built with ❤️ and Google Gemini AI
      </div>
    </div>
  )
}
