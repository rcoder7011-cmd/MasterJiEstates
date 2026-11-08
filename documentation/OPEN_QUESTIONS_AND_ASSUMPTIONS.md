# MasterJiEstates — Open Questions, Technical Assumptions & Decision Log

---

## 1. Architectural Baseline Assumptions

In authoring this comprehensive blueprint without making speculative implementation decisions, the following technical and operational baselines are established:

1. **Official Domain Ownership:**
   - The apex domain `https://masterjiestates.in` has been acquired by the stakeholder.
   - The intended subdomain structure is:
     - Public Client Web App: `https://masterjiestates.in` and `https://www.masterjiestates.in`
     - REST API Service: `https://api.masterjiestates.in`
     - Proposed Corporate Email: `info@masterjiestates.in` *(Proposed handle; mailbox configuration pending)*.
2. **Decoupled Architecture:**
   - The system is architected as an independent React SPA communicating with a stateless Node.js/Express REST API via standard CORS-enabled HTTP-only cookie sessions.
3. **No Direct Online Property Purchase Payments:**
   - In accordance with Indian real estate statutory requirements, property transactions require government stamp duty payments, physical registry at the Sub-Registrar's Office, and legal deed execution. High-value property purchases will **not** be processed via standard retail payment gateways (like Razorpay or Stripe). The platform manages the lead, negotiation, and commission settlement pipeline; payments are executed via bank transfer (NEFT/RTGS) and logged into the administrative ledger.
4. **Unified User Architecture:**
   - A single registered account operates across both Buyer and Seller functional surfaces. No separate logins are required or permitted.
5. **Illustrative Demo Content Policy:**
   - In the absence of an initial live property catalog, approximately 50–100 AI-generated illustrative property photographs stored in Cloudinary will be utilized during development and staging.
   - All demo records will carry an internal database flag (`isDemo: true`) and public disclaimers to ensure they are never misrepresented as genuine verified real estate inventory.

---

## 2. Open Technical Questions & Pending Decisions

The following infrastructure, operational, and integration choices remain pending and will be resolved prior to their corresponding development milestones:

| Category | Decision Item | Options Under Consideration | Recommended Approach | Milestone Dependency |
| :--- | :--- | :--- | :--- | :---: |
| **Domain & DNS** | DNS & Nameserver Management | Cloudflare DNS, GoDaddy, Hostinger, AWS Route53 | Cloudflare DNS (Free tier provides instant SSL, DDoS shield, and simple subdomain routing) | Part 15 |
| **Frontend Host** | Static Site Hosting Provider | Cloudflare Pages, Vercel, Netlify | Cloudflare Pages (Seamless integration with Cloudflare DNS, zero-cost edge delivery) | Part 2, Part 15 |
| **Backend Host** | Node.js Runtime Platform | Render, Railway, AWS App Runner, DigitalOcean VPS | Render (Web Service tier with automated GitHub deployments, health checks, and SSL) | Part 2, Part 15 |
| **Database** | MongoDB Atlas Cluster Region | `ap-south-1` (Mumbai), `ap-southeast-1` (Singapore) | `ap-south-1` (Mumbai) to ensure minimal latency for Indian visitors | Part 8 |
| **Email Gateway** | Transactional Email Service | Resend, SendGrid, AWS SES, Nodemailer SMTP | Resend or SendGrid (Modern developer API, high inbox deliverability) | Part 9 |
| **Phone / OTP** | SMS Verification Provider | MSG91, Twilio, Fast2SMS, Disabled in MVP | Phone number captured as required field; active SMS OTP deferred to post-MVP to avoid recurring SMS costs | Part 9 |
| **Media Storage** | Cloudinary Tier & Watermarking | Cloudinary Free Tier (25 Credits/mo) vs Paid | Free tier with server-side signed presets and text-based watermark overlays | Part 11 |
| **Commission Defaults**| Standard Brokerage Slab | 1.0%, 1.5%, 2.0% of final sale value | Configurable via `websiteSettings` CMS with a default baseline of 1.5% | Part 13 |
| **Legal Counsel** | Brokerage Mandate Digital Terms | Standard e-signature vs Checkbox Acceptance | Digital click-wrap terms with timestamp and IP logging upon property submission | Part 11 |

---

## 3. Risk Log & Mitigation Strategy

| Risk ID | Identified Risk | Impact | Probability | Mitigation Strategy in Architecture |
| :--- | :--- | :---: | :---: | :--- |
| **RSK-01** | Scrapers harvesting property owner phone numbers | Critical | High | Absolute backend PII masking; owner contact is never included in public API projections; company helpline displayed exclusively. |
| **RSK-02** | Exposure of confidential company purchase costs and CapEx | Critical | Medium | Stored in isolated collections (`purchases`, `expenses`) completely disconnected from public property schemas; strictly restricted to `admin` role. |
| **RSK-03** | Unauthorized admin elevation via public registration | Critical | Low | Role is hardcoded to `'user'` in registration controller; profile update endpoints whitelist mutable fields; admin created only via CLI seed script. |
| **RSK-04** | Cross-Subdomain cookie drop failures | High | Medium | Explicit cookie domain scoping (`domain: .masterjiestates.in`) with `SameSite=Lax` and CORS credentials enabled on both client and API. |
| **RSK-05** | High-resolution image upload delays on slow mobile networks | Medium | High | Client-side Canvas-based image downscaling before upload; Cloudinary auto-format (f_auto) and compression (q_auto). |
| **RSK-06** | Lead spamming via automated bots | Medium | High | Multi-tier rate limiting on enquiry submissions (5/hour/IP) and honeypot input fields. |

