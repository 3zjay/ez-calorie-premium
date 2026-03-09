export default function Paywall({ feature }) {
  return (
    <div className="page fadeUp" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>⭐</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>
        Unlock <span className="grad">{feature}</span>
      </h2>
      <p style={{ color: '#666', fontFamily: 'DM Mono, monospace', fontSize: 13, lineHeight: 1.8, marginBottom: 32 }}>
        This feature is part of EZ Calorie Premium.<br />
        Get your full daily food log, goal tracker,<br />
        weekly charts and meal reminders.
      </p>

      <div className="card" style={{ textAlign: 'left', marginBottom: 20 }}>
        <div className="card-title">What you unlock</div>
        {[
          ['📅', 'Daily food log — every meal saved'],
          ['🎯', 'Calorie goal with live progress bar'],
          ['📊', 'Weekly charts — calories & macros'],
          ['🔔', 'Meal reminders — never forget to log'],
          ['☁️',  'Cloud sync across all your devices'],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 14, color: '#aaa' }}>{text}</span>
          </div>
        ))}
      </div>

      <button className="btn-main" style={{ marginBottom: 10 }}>
        🚀 Start 7-Day Free Trial
      </button>
      <p style={{ color: '#333', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
        then $4.99/month · cancel anytime
      </p>

      <div style={{ marginTop: 20, padding: 14, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 12 }}>
        <p style={{ fontSize: 12, color: '#4ade80', fontFamily: 'DM Mono, monospace' }}>
          ✦ Stripe payments coming soon — join the waitlist below
        </p>
      </div>
    </div>
  )
}
