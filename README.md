# Nutri Suddh Monorepo

This project is split into two main folders:

- `frontend/` - React + Vite storefront UI
- `backend/` - Express API for Razorpay order + verification

## Run locally

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8787`

## Build

```bash
npm run build
```

## Environment

Set secrets in `backend/.env`:

```bash
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
PUBLIC_RAZORPAY_KEY_ID=...

# Email (SMTP) for order notifications
SMTP_HOST=...
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
# Optional: preferred single-string config (overrides host/port/user/pass)
# SMTP_URL=smtps://username:password@smtp.your-provider.com:465
ADMIN_NOTIFICATION_EMAIL=admin@gmail.com
```

Email behavior:
- Customer gets order confirmation email when order is placed.
- Admin gets order confirmation email with customer + delivery details.
- Customer gets daily status email until order status becomes `Delivered`.
