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

---

## VPS Hosting (Ubuntu + Nginx + systemd)

Use this if you want to host everything on your own VPS.

### A) One-time server setup

1. Install packages:
   - `sudo apt update && sudo apt install -y nginx git curl`
2. Install Node.js 20:
   - `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -`
   - `sudo apt install -y nodejs`
3. Clone repo:
   - `sudo mkdir -p /var/www`
   - `cd /var/www`
   - `sudo git clone https://github.com/falverrawork-cpu/nutrisuddh-site.git`
   - `sudo chown -R $USER:$USER /var/www/nutrisuddh-site`
4. Configure backend env:
   - `cp /var/www/nutrisuddh-site/backend/.env /var/www/nutrisuddh-site/backend/.env` (or create it with production secrets)

### B) Configure systemd + nginx

1. Install backend service:
   - `sudo cp /var/www/nutrisuddh-site/deploy/vps/nutrisuddh-backend.service /etc/systemd/system/`
   - `sudo systemctl daemon-reload`
   - `sudo systemctl enable nutrisuddh-backend`
2. Install nginx site:
   - `sudo cp /var/www/nutrisuddh-site/deploy/vps/nginx-nutrisuddh.conf /etc/nginx/sites-available/nutrisuddh`
   - `sudo ln -sf /etc/nginx/sites-available/nutrisuddh /etc/nginx/sites-enabled/nutrisuddh`
   - `sudo rm -f /etc/nginx/sites-enabled/default`
   - `sudo nginx -t && sudo systemctl restart nginx`

### C) Deploy updates

Run:

`bash /var/www/nutrisuddh-site/deploy/vps/deploy-vps.sh`

This script will:
- pull latest `main`
- install dependencies
- build frontend/backend
- restart backend service
- reload nginx
