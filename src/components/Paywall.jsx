import { useUserContext } from '../context/UserContext'

export default function Paywall({ feature }) {
  const { startCheckout } = useUserContext()

  return (
    <div className="page fadeUp" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>⭐</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>
        Unlock <span className="grad">{feature}</span>
      </h2>
      <p style={{ color: '#666', fontFamily: 'DM Mono, monospace', fontSize: 13, lineHeight: 1.8, marginBottom: 32 }}>
        This is a Premium feature.<br />
        Get your full daily food log, goal tracker,<br />
        weekly charts and meal reminders.
      </p>

      <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
        <div className="card-title">What you unlock</div>
        {[
          ['📅', 'Daily food log — every meal saved to the cloud'],
          ['🎯', 'Calorie goal with live progress bar'],
          ['📊', 'Weekly charts — calories & macros over time'],
          ['🔔', 'Meal reminders — never forget to log'],
          ['☁️',  'Cloud sync — access your log on any device'],
        ].map(([icon, text]) => (
          <div key={text} style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 14, color: '#aaa' }}>{text}</span>
          </div>
        ))}
      </div>

      <button className="btn-main" onClick={startCheckout} style={{ marginBottom: 10 }}>
        🚀 Start 7-Day Free Trial
      </button>
      <p style={{ color: '#444', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
        then $4.99/month · cancel anytime · no hidden fees
      </p>
    </div>
  )
}
