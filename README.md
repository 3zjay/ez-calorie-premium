# EZ Calorie Premium 🍔⭐

AI-powered food nutrition scanner with daily log, calorie goals, weekly charts and meal reminders.

## Setup

### 1. Clone & install
```bash
npm install
```

### 2. Set up Clerk (auth)
1. Go to [clerk.com](https://clerk.com) → Create app
2. Enable **Google** as a sign-in method
3. Copy your **Publishable Key**

### 3. Add environment variables
```bash
cp .env.example .env
# Paste your Clerk key into .env
```

Your `.env` file:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Render
1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Static Site
3. Connect your repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variable: `VITE_CLERK_PUBLISHABLE_KEY`
7. Deploy!

## Features

| Tab | Description |
|-----|-------------|
| 📸 Scanner | Upload food photo → AI returns calories & macros |
| 📅 Log | Daily food log with totals, goal bar, history |
| 📊 Charts | Weekly calorie bar chart + macro trend lines |
| ⚙️ Settings | Account, subscription, reminders, data management |

## Coming Next (Phase 3)
- Stripe subscription ($4.99/mo)
- Push notification meal reminders
- Cloud sync via Supabase
