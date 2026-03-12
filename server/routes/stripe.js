import express from 'express'
import Stripe from 'stripe'
import { requireAuth } from '../middleware/auth.js'
import { supabase, ensureUser } from '../db.js'

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// POST /api/stripe/checkout — create Stripe checkout session
router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const user = await ensureUser(req.clerkId, req.email)
    const appUrl = process.env.VITE_API_URL || 'http://localhost:3000'

    // Create or reuse Stripe customer
    let customerId = user.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ email: req.email, metadata: { clerk_id: req.clerkId } })
      customerId = customer.id
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: `${appUrl}/?upgrade=success`,
      cancel_url: `${appUrl}/?upgrade=cancelled`,
    })

    res.json({ url: session.url })
  } catch (e) {
    console.error('Stripe checkout error:', e)
    res.status(500).json({ error: e.message })
  }
})

// POST /api/stripe/portal — customer billing portal (manage/cancel)
router.post('/portal', requireAuth, async (req, res) => {
  try {
    const user = await ensureUser(req.clerkId, req.email)
    if (!user.stripe_customer_id) return res.status(400).json({ error: 'No subscription found' })
    const appUrl = process.env.VITE_API_URL || 'http://localhost:3000'
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
