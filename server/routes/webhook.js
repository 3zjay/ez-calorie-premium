import express from 'express'
import Stripe from 'stripe'
import { supabase } from '../db.js'

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    console.error('Webhook signature failed:', e.message)
    return res.status(400).send(`Webhook Error: ${e.message}`)
  }

  const session = event.data.object

  switch (event.type) {
    // Payment succeeded — unlock premium
    case 'checkout.session.completed':
    case 'invoice.paid': {
      const customerId = session.customer
      if (customerId) {
        await supabase.from('users').update({ is_premium: true }).eq('stripe_customer_id', customerId)
        console.log('✅ Premium unlocked for customer:', customerId)
      }
      break
    }
    // Subscription cancelled or payment failed — revoke premium
    case 'customer.subscription.deleted':
    case 'invoice.payment_failed': {
      const customerId = session.customer
      if (customerId) {
        await supabase.from('users').update({ is_premium: false }).eq('stripe_customer_id', customerId)
        console.log('❌ Premium revoked for customer:', customerId)
      }
      break
    }
  }

  res.json({ received: true })
})

export default router
