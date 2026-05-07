# Postal — Self-Hosted Email Server Setup

## 1. DNS Records

Add these DNS records for `bododesderio.com`:

```
# Mail server identity
A     smtp.bododesderio.com        → YOUR_SERVER_IP
A     postal.bododesderio.com      → YOUR_SERVER_IP

# MX record (receive bounces)
MX    bododesderio.com             → mx.bododesderio.com (priority 10)
A     mx.bododesderio.com          → YOUR_SERVER_IP

# SPF — authorize your server to send email
TXT   bododesderio.com             → "v=spf1 ip4:YOUR_SERVER_IP ~all"

# Return path for bounce handling
CNAME rp.bododesderio.com          → rp.postal.bododesderio.com

# Click/open tracking
CNAME track.bododesderio.com       → YOUR_SERVER_IP

# DKIM — add AFTER running postal initialize (it generates the record)
TXT   postal-XXXX._domainkey.bododesderio.com → (from Postal web UI)
```

## 2. Generate Keys

```bash
cd infra/postal

# Signing key for DKIM
openssl genrsa -out signing.key 1024

# Postal secret key — paste into postal.yml
openssl rand -hex 32

# Database password — paste into .env and postal.yml
openssl rand -base64 24
```

## 3. Update postal.yml

Replace all `CHANGE_ME_*` values with the generated secrets.

## 4. First Run

```bash
cd infra/postal

# Initialize database schema
docker compose run --rm postal initialize

# Create your admin user
docker compose run --rm postal make-user

# Start everything
docker compose up -d
```

## 5. Configure Postal Web UI

1. Open `http://postal.bododesderio.com:5000`
2. Log in with the admin user you created
3. Create an **Organization** (e.g., "Bodo Desderio")
4. Create a **Mail Server** (e.g., "portfolio")
5. Add your domain `bododesderio.com` — Postal shows you the DKIM record to add
6. Create a **Credential** (SMTP username/password)
7. Copy the username + password into your portfolio `.env`:
   ```
   SMTP_USER=<credential-username>
   SMTP_PASS=<credential-password>
   ```

## 6. Test

```bash
# From your server, test SMTP connectivity
docker exec -it bodo_app_prod sh -c \
  "node -e \"const nm=require('nodemailer');const t=nm.createTransport({host:'postal',port:25,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});t.verify().then(()=>console.log('SMTP OK')).catch(console.error)\""
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│  portfolio_backend network (internal)            │
│                                                  │
│  ┌──────────┐  ┌───────┐  ┌──────────────────┐  │
│  │ postgres │  │ redis │  │ postal (SMTP:25) │  │
│  └──────────┘  └───────┘  └──────────────────┘  │
│       ↑            ↑              ↑              │
│       └────────────┼──────────────┘              │
│                    │                             │
│              ┌───────────┐                       │
│              │  next.js  │                       │
│              │   app     │                       │
│              └───────────┘                       │
│                    ↑                             │
└────────────────────┼─────────────────────────────┘
                     │
              ┌──────────────┐
              │   traefik    │ ← ports 80/443
              └──────────────┘
```
