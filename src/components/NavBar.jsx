import styles from './NavBar.module.css'

const TABS = [
  { id: 'scan',     icon: '📸', label: 'Scan' },
  { id: 'log',      icon: '📅', label: 'Log' },
  { id: 'charts',   icon: '📊', label: 'Charts' },
  { id: 'settings', icon: '⚙️',  label: 'Settings' },
]

export default function NavBar({ active, onChange }) {
  return (
    <nav className={styles.nav}>
      {TABS.map(t => (
        <button
          key={t.id}
          className={`${styles.tab} ${active === t.id ? styles.active : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className={styles.icon}>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
