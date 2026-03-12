import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

const UserContext = createContext({})

const API = import.meta.env.VITE_API_URL || ''

export function UserProvider({ children }) {
  const { getToken, isSignedIn } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [calorieGoal, setCalorieGoal] = useState(0)
  const [loading, setLoading] = useState(true)

  async function fetchUser() {
    if (!isSignedIn) return
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setIsPremium(data.isPremium)
        setCalorieGoal(data.calorieGoal || 0)
      }
    } catch (e) {
      console.error('Failed to fetch user:', e)
    } finally {
      setLoading(false)
    }
  }

  async function updateGoal(goal) {
    try {
      const token = await getToken()
      await fetch(`${API}/api/user/goal`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      })
      setCalorieGoal(goal)
    } catch (e) {
      console.error('Failed to update goal:', e)
    }
  }

  async function startCheckout() {
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/stripe/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Could not start checkout: ' + (data.error || 'Unknown error'))
    } catch (e) {
      alert('Checkout failed: ' + e.message)
    }
  }

  async function openBillingPortal() {
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/stripe/portal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      alert('Could not open billing portal: ' + e.message)
    }
  }

  useEffect(() => { fetchUser() }, [isSignedIn])

  return (
    <UserContext.Provider value={{ isPremium, calorieGoal, loading, fetchUser, updateGoal, startCheckout, openBillingPortal }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => useContext(UserContext)
