import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import stripeRoutes from './routes/stripe.js'
import webhookRoutes from './routes/webhook.js'
import logRoutes from './routes/log.js'
import userRoutes from './routes/user.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// Webhook route MUST come before express.json() — Stripe needs raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), webhookRoutes)

app.use(cors({
  origin: process.env.VITE_API_URL || '*',
  credentials: true
}))
app.use(express.json())

// API routes
app.use('/api/stripe', stripeRoutes)
app.use('/api/log', logRoutes)
app.use('/api/user', userRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Serve React build
app.use(express.static(path.join(__dirname, '../dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(PORT, () => console.log(`✅ EZ Calorie Premium running on port ${PORT}`))
