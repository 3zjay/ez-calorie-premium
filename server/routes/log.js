import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { supabase, ensureUser } from '../db.js'

const router = express.Router()

// GET /api/log?date=YYYY-MM-DD — get all entries for a date
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await ensureUser(req.clerkId, req.email)
    const { date } = req.query
    if (!date) return res.status(400).json({ error: 'date param required' })

    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date_key', date)
      .order('logged_at', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/log/week — get last 7 days of logs
router.get('/week', requireAuth, async (req, res) => {
  try {
    const user = await ensureUser(req.clerkId, req.email)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const fromDate = sevenDaysAgo.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date_key', fromDate)
      .order('logged_at', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/log — add a food entry
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = await ensureUser(req.clerkId, req.email)
    const { foodName, emoji, calories, protein, carbs, fat, fiber, servingSize, dateKey, timeLabel } = req.body

    const { data, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: user.id,
        date_key: dateKey,
        food_name: foodName,
        emoji,
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        fiber: fiber || 0,
        serving_size: servingSize,
        time_label: timeLabel,
      })
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/log/:id — delete a food entry
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const user = await ensureUser(req.clerkId, req.email)
    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', user.id) // Ensure users can only delete their own entries

    if (error) throw error
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/log/day/:date — clear all entries for a day
router.delete('/day/:date', requireAuth, async (req, res) => {
  try {
    const user = await ensureUser(req.clerkId, req.email)
    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('user_id', user.id)
      .eq('date_key', req.params.date)

    if (error) throw error
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
