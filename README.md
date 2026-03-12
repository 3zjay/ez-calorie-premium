# EZ Calorie Premium — Phase 3 🍔⭐💳

Full-stack app with Stripe payments, Supabase cloud sync, and meal reminders.

---

## 🗄️ Step 1 — Supabase Setup

1. Go to **supabase.com** → open your project
2. Click **SQL Editor** → **New Query**
3. Paste the entire contents of `supabase-schema.sql` and click **Run**
4. Go to **Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 💳 Step 2 — Stripe Setup

1. Go to **stripe.com** → make sure you're in **Test Mode**
2. Go to **Developers → API Keys** and copy:
   - Publishable key → `VITE_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
3. Go to **Products → Add Product**:
   - Name: `EZ Calorie Premium`
   - Price: `$4.99` recurring monthly
   - Copy the **Price ID** (starts with `price_`) → `STRIPE_PRICE_ID`
4. Go to **Developers → Webhooks → Add endpoint**:
   - URL: `https://your-render-url.onrender.com/api/stripe/webhook`
   - Events to listen for: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy **Signing Secret** → `STRIPE_WEBHOOK_SECRET`
5. Go to **Settings → Billing → Customer portal** → turn it on

---

## ⚙️ Step 3 — Environment Variables

Add ALL of these to your Render service (Settings → Environment):

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_API_URL=https://your-render-url.onrender.com
```

---

## 🚀 Step 4 — Update Render Service

> ⚠️ IMPORTANT: Change from Static Site → Web Service

1. In Render, **delete** your current Static Site service
2. Create a **New Web Service** → connect same GitHub repo
3. Settings:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Node version:** 18
4. Add all environment variables from Step 3
5. Deploy!

---

## 📁 Step 5 — Push to GitHub

Replace all your old files with the new ones from this zip, then:
```bash
git add .
git commit -m "Phase 3: Stripe + Supabase + cloud sync"
git push
```

Render auto-deploys on push ✅

---

## Testing Stripe (Test Mode)

Use test card: **4242 4242 4242 4242** · any future date · any CVC
