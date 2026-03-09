import { useClerk } from '@clerk/clerk-react'

export default function LandingPage() {
  const { openSignIn } = useClerk()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="blob1" />
      <div className="blob2" />
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        <div style={{ fontSize: 64, marginBottom: 16 }}>🍔</div>
        <div style={{ fontSize: 12, letterSpacing: '0.3em', color: '#ff6b35', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 12 }}>
          AI Nutrition Scanner
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 10vw, 3.2rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 16 }}>
          EZ Calorie<br /><span className="grad">Premium</span>
        </h1>
        <p style={{ color: '#555', fontFamily: 'DM Mono, monospace', fontSize: 13, lineHeight: 1.8, marginBottom: 36 }}>
          Snap a photo of your food.<br />
          Track your deficit. Hit your goals.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
          {[
            ['📸', 'Scan any food', 'AI identifies calories & macros instantly'],
            ['📅', 'Daily log', 'Every meal saved automatically'],
            ['🎯', 'Goal tracker', 'Live progress toward your calorie target'],
            ['📊', 'Weekly charts', 'See your trends at a glance'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="card" style={{ textAlign: 'left', padding: 16 }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        <button className="btn-main" onClick={() => openSignIn()} style={{ marginBottom: 12 }}>
          Sign in with Google →
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 99, padding: '6px 14px', fontSize: 12, color: '#4ade80', fontFamily: 'DM Mono, monospace' }}>
          ✦ 7-day free trial · then $4.99/mo
        </div>

        <p style={{ marginTop: 20, color: '#333', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
          Already using the free scanner?{' '}
          <a href="https://ez-calorie-deficit.onrender.com" style={{ color: '#ff6b35', textDecoration: 'none' }}>
            Use it here →
          </a>
        </p>

      </div>
    </div>
  )
}
