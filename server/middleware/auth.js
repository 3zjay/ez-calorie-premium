import { createClerkClient } from '@clerk/backend'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'No token provided' })
    const payload = await clerk.verifyToken(token)
    req.clerkId = payload.sub
    req.email = payload.email || ''
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token: ' + e.message })
  }
}
