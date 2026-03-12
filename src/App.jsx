import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { UserProvider } from './context/UserContext'
import { LogProvider } from './context/LogContext'
import NavBar from './components/NavBar'
import Scanner from './pages/Scanner'
import Log from './pages/Log'
import Charts from './pages/Charts'
import Settings from './pages/Settings'
import LandingPage from './pages/LandingPage'

function Inner() {
  const [tab, setTab] = useState('scan')
  const { isSignedIn, isLoaded } = useAuth()

  // Handle redirect back from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgrade') === 'success') {
      window.history.replaceState({}, '', '/')
      setTab('settings')
    }
  }, [])

  if (!isLoaded) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <span className="spin" style={{ fontSize: 32 }}>⟳</span>
    </div>
  )

  if (!isSignedIn) return <LandingPage />

  return (
    <>
      <div className="blob1" />
      <div className="blob2" />
      {tab === 'scan'     && <Scanner />}
      {tab === 'log'      && <Log />}
      {tab === 'charts'   && <Charts />}
      {tab === 'settings' && <Settings />}
      <NavBar active={tab} onChange={setTab} />
    </>
  )
}

export default function App() {
  return (
    <UserProvider>
      <LogProvider>
        <Inner />
      </LogProvider>
    </UserProvider>
  )
}
