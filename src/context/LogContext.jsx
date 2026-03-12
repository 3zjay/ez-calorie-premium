import { createContext, useContext } from 'react'
import { useAuth } from '@clerk/clerk-react'

const LogContext = createContext({})
const API = import.meta.env.VITE_API_URL || ''

export function LogProvider({ children }) {
  const { getToken } = useAuth()

  async function authFetch(path, opts = {}) {
    const token = await getToken()
    return fetch(`${API}${path}`, {
      ...opts,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) }
    })
  }

  async function getLog(date) {
    const res = await authFetch(`/api/log?date=${date}`)
    if (!res.ok) throw new Error('Failed to fetch log')
    return res.json()
  }

  async function getWeekLog() {
    const res = await authFetch('/api/log/week')
    if (!res.ok) throw new Error('Failed to fetch week log')
    return res.json()
  }

  async function addEntry(entry) {
    const res = await authFetch('/api/log', {
      method: 'POST',
      body: JSON.stringify(entry)
    })
    if (!res.ok) throw new Error('Failed to add entry')
    return res.json()
  }

  async function deleteEntry(id) {
    const res = await authFetch(`/api/log/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete entry')
  }

  async function clearDay(date) {
    const res = await authFetch(`/api/log/day/${date}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to clear day')
  }

  return (
    <LogContext.Provider value={{ getLog, getWeekLog, addEntry, deleteEntry, clearDay }}>
      {children}
    </LogContext.Provider>
  )
}

export const useLog = () => useContext(LogContext)
