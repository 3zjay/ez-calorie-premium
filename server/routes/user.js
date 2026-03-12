import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { supabase, ensureUser } from '../db.js'

const router = express.Router()

// GET /api/user/me — get or create user, return premium status + goal
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await ensureUser(req.clerkId, req.email)
    res.json({ isPremium: user.is_premium, calorieGoal: user.calorie_goal, id: user.id })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PATCH /api/user/goal — update calorie goal
router.patch('/goal', requireAuth, async (req, res) => {
  try {
    const { goal } = req.body
    const user = await ensureUser(req.clerkId, req.email)
    await supabase.from('users').update({ calorie_goal: goal }).eq('id', user.id)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
