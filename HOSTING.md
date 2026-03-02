# Hosting Guide (Production)

This project is best hosted as:
- `frontend` on Vercel (static React app)
- `backend` on Render (Node web service)

## 1) Deploy Backend (Render)

1. Push this repo to GitHub.
2. In Render, create a new `Web Service` from the repo.
3. Set:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
4. Add environment variables:
   - `PORT=8787`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `SMTP_URL` (recommended) OR `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
   - `ADMIN_NOTIFICATION_EMAIL`
5. Important for SQLite:
   - Attach a persistent disk/volume and mount it so `backend/data` remains persistent across restarts.
6. Deploy and copy backend URL, for example:
   - `https://nutrisuddh-api.onrender.com`

## 2) Deploy Frontend (Vercel)

1. In Vercel, import the same repo.
2. Set:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-backend-domain>`
     - Example: `https://nutrisuddh-api.onrender.com`
4. Deploy.

## 3) Verify After Go-Live

1. Open the website and submit:
   - Contact form
   - Bulk enquiry form
2. Open admin dashboard:
   - Forms load
   - Bulk Queries load
   - Reply action works
3. Use `Test Email` button in admin dashboard.
4. Place a test order and verify:
   - Order stored in admin
   - Confirmation email behavior

## 4) Troubleshooting

- Frontend cannot call API:
  - Recheck `VITE_API_BASE_URL` in Vercel.
- SMTP test fails:
  - Use `SMTP_URL` format if possible.
  - Verify provider allows app SMTP login.
- Data resets after redeploy:
  - Backend disk/volume is not persistent or not mounted correctly.
