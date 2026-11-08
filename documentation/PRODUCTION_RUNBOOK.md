# MasterJiEstates — Production Deployment & Operations Runbook

**Official Domain:** `https://masterjiestates.in`  
**API Endpoint:** `https://api.masterjiestates.in/api`  
**Milestone:** Part 15 of 15 (Final Testing, Optimization & Production Deployment)

---

## 1. System Architecture Overview

```
                      Internet / Visitors
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       https://masterjiestates.in      https://api.masterjiestates.in
       [Cloudflare Pages / Edge]       [Render / Node Container]
               │                               │
        React 19 SPA                    Express 4.21 API
      (Vite 6, Tailwind)              (Security, RBAC, CSRF)
               │                               │
               └───────────────┬───────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       MongoDB Atlas Database       Cloudinary Media CDN
        (Mongoose 9 Replica)        (Signed Image Vault)
```

---

## 2. Environment Variable Configuration

### 2.1 Backend Environment Variables (`server/.env`)

Configure these variables in your backend hosting platform (e.g. Render, Railway, AWS ECS, or Docker):

| Variable | Required | Production Value / Description | Example |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | Must be set to `production`. Activates strict DB error handling, secure cookies, and disables debug stack traces. | `production` |
| `PORT` | **Yes** | Port provided by host environment (default `5000` or assigned by `$PORT`). | `5000` |
| `CLIENT_URL` | **Yes** | Whitelisted frontend origin for CORS and credentials sharing. | `https://masterjiestates.in` |
| `MONGODB_URI` | **Yes** | Production MongoDB Atlas replica set URI with read-write credentials. | `mongodb+srv://admin:<password>@cluster0.mongodb.net/masterji_estates?retryWrites=true&w=majority` |
| `JWT_SECRET` | **Yes** | Cryptographically secure random secret key (64+ hexadecimal characters). | *[Generated 64-char secret]* |
| `ADMIN_SEED_SECRET_KEY` | **Yes** | Master authentication key required to authorize CLI administrative onboarding. | *[Generated 32-char secret]* |
| `COOKIE_DOMAIN` | Optional | Shared domain for cross-subdomain cookies. Set to `.masterjiestates.in` if frontend and API share a root domain. | `.masterjiestates.in` |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | Production Cloudinary Cloud Name. | `masterji-prod` |
| `CLOUDINARY_API_KEY` | **Yes** | Production Cloudinary API Key. | `123456789012345` |
| `CLOUDINARY_API_SECRET` | **Yes** | Production Cloudinary API Secret (backend ONLY; never expose to frontend). | `abcdefghijklmnopqrstuv_12345` |
| `CLOUDINARY_FOLDER` | **Yes** | Root cloud folder namespace for property assets. | `masterji_estates/properties` |

### 2.2 Frontend Environment Variables (`client/.env`)

Configure these variables in your frontend hosting platform (e.g. Cloudflare Pages or Vercel):

| Variable | Required | Production Value / Description | Example |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | Absolute URL to the backend REST API `/api` root. | `https://api.masterjiestates.in/api` |

---

## 3. Step-by-Step Deployment Instructions

### 3.1 Frontend Deployment: Cloudflare Pages (Recommended)

1. **Link Repository:** Connect your GitHub / GitLab repository to Cloudflare Pages.
2. **Build Settings:**
   - **Framework preset:** `Vite`
   - **Root directory:** `client`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** `20.x` or `22.x` (set environment variable `NODE_VERSION=20`)
3. **Environment Variables:**
   - Add `VITE_API_BASE_URL=https://api.masterjiestates.in/api`
4. **Single Page Application (SPA) Routing:**
   - Cloudflare Pages automatically handles SPA routing for Vite applications. Alternatively, verify `client/public/_redirects` contains:
     ```
     /*    /index.html   200
     ```
5. **Deploy:** Click **Save and Deploy**. Once completed, your application will be live at `https://<project-name>.pages.dev`.

---

### 3.2 Backend Deployment: Render (Recommended)

1. **Create Web Service:** In the Render dashboard, click **New +** -> **Web Service**.
2. **Connect Repository:** Select the `MasterJiEstates` repository.
3. **Configure Service:**
   - **Name:** `masterjiestates-api`
   - **Region:** Singapore / Mumbai (closest to Indian users for low latency)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Starter or Standard (recommended for production uptime)
4. **Environment Variables:**
   - Input all variables from Section 2.1 above.
5. **Health Check Path:**
   - Set health check path to `/api/health`
6. **Deploy:** Render will trigger the build and start the Express service.

---

### 3.3 Backend Docker Deployment (Alternative)

If deploying to AWS ECS, DigitalOcean App Platform, or a VPS with Docker:

```dockerfile
# Multi-stage production Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production

COPY server/ ./

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
USER node
EXPOSE 5000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -f Dockerfile -t masterjiestates-api .
docker run -d -p 5000:5000 --env-file server/.env masterjiestates-api
```

---

## 4. Custom Domain & DNS Mapping

Configure these DNS records with your registrar or DNS provider (e.g., Cloudflare):

| Type | Name | Target / Value | Proxy Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `@` / `masterjiestates.in` | `<project-name>.pages.dev` | Proxied | Apex Domain (Cloudflare CNAME flattening) |
| **CNAME** | `www` | `<project-name>.pages.dev` | Proxied | Subdomain Redirection |
| **CNAME** | `api` | `masterjiestates-api.onrender.com` | DNS Only or Proxied | Backend REST API Service |

---

## 5. Pre-Launch Verification Checklist

Execute these verification checks before announcing public launch:

- [ ] **Liveness Probe:** `curl https://api.masterjiestates.in/api/health` returns `200 OK` with `status: "healthy"`.
- [ ] **Readiness Probe:** `curl https://api.masterjiestates.in/api/health/ready` returns `200 OK` with `status: "ready"` and MongoDB Atlas connected.
- [ ] **SSL / TLS:** Verify valid HTTPS certificates on both `https://masterjiestates.in` and `https://api.masterjiestates.in`.
- [ ] **Initial Admin Bootstrapping:** Authorize the master administrator account:
  ```bash
  node scripts/seedAdmin.js \
    --name "Super Administrator" \
    --email "admin@masterjiestates.in" \
    --phone "9876543210" \
    --password "StrongAdminPassword123!" \
    --key "<ADMIN_SEED_SECRET_KEY>"
  ```
- [ ] **Media Uploads:** Complete a test property submission in `/dashboard/listings/new` with a photo to verify live Cloudinary signature creation and CDN delivery.
- [ ] **CORS Verification:** Verify that API requests from `https://masterjiestates.in` are permitted with credentials (`Access-Control-Allow-Credentials: true`).
- [ ] **SEO Verification:** Verify `https://masterjiestates.in/robots.txt` and `https://masterjiestates.in/sitemap.xml` are accessible.
- [ ] **404 Routing:** Navigate to `https://masterjiestates.in/non-existent-page` and confirm the branded MasterJiEstates 404 page renders.

---

## 6. Incident Response & Troubleshooting

| Symptom | Root Cause | Solution |
| :--- | :--- | :--- |
| **503 Service Unavailable on `/api/health/ready`** | MongoDB Atlas cluster is unreachable or IP address is not whitelisted. | In MongoDB Atlas -> Network Access, ensure `0.0.0.0/0` or the hosting provider's egress IP range is allowed. |
| **403 Forbidden on CSRF requests** | Missing or mismatched `x-csrf-token` header or cross-domain cookie blocked. | Verify `CLIENT_URL` matches exactly with no trailing slash, and check `COOKIE_DOMAIN` configuration. |
| **503 on Image Upload Signature** | `CLOUDINARY_API_KEY` or `CLOUDINARY_API_SECRET` unconfigured. | Verify all Cloudinary environment variables in hosting settings. |
| **Blank Page on Deep Links** | SPA fallback missing on static web server. | Ensure hosting provider rewrites `/*` to `/index.html`. |

