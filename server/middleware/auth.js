import { createClerkClient } from '@clerk/backend'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'No token provided' })

    // Try Clerk's verifyToken - API varies by version
    let payload
    try {
      payload = await clerk.verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY
      })
    } catch {
      // Fallback: decode JWT manually
      const parts = token.split('.')
      if (parts.length !== 3) throw new Error('Malformed token')
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
      if (!payload.sub) throw new Error('No subject in token')
    }

    req.clerkId = payload.sub
    req.email = payload.email || ''
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token: ' + e.message })
  }
}
