# MasterJiEstates — Security Architecture & Threat Mitigation Blueprint

---

## 1. Threat Modeling & Attack Surface Analysis

MasterJiEstates handles high-value real estate assets, sensitive financial ledgers, and private owner PII. The threat surface is systematically fortified against the OWASP Top 10 web application vulnerabilities.

```mermaid
graph TD
    ATTACKER[Potential Adversary / Malicious Bot]
    
    subgraph Perimeter Defense
        CF[Cloudflare WAF & DDoS Filter]
        RATE[Express Rate Limiters]
        CORS_MW[Strict CORS Policy]
        HELM[Helmet Security Headers]
    end

    subgraph Authentication & Session Security
        COOKIE[HttpOnly Secure SameSite Cookie]
        BCRYPT[bcrypt 12 Salt Rounds]
        NO_STORAGE[Strictly Zero JWT in LocalStorage]
        SEED_ONLY[Admin Creation CLI-Only]
    end

    subgraph Data & Object-Level Defense
        RBAC[Server-Side Role Guard]
        ABAC[Object Ownership Validator Anti-IDOR]
        SAN[Mongo Sanitize Anti-NoSQLi]
        MASK[DTO Serialization PII & Margin Masking]
    end

    ATTACKER --> Perimeter Defense
    Perimeter Defense --> Authentication & Session Security
    Authentication & Session Security --> Data & Object-Level Defense
    Data & Object-Level Defense --> CORE[(Database & Business Operations)]
```

---

## 2. Authentication & Session Hardening

### 2.1 Password Security & Storage
- **Algorithm:** bcrypt with 12 salt rounds (computationally expensive to thwart offline rainbow table and GPU dictionary attacks).
- **Password Constraints:** Minimum 8 characters, maximum 64 characters, requiring at least one uppercase letter, one digit, and one special character (`[@$!%*?&#]`).
- **Zero Plaintext Principle:** Plaintext passwords never touch logs, error messages, or cache layers.
- **Database Projection:** The `password` field on the Mongoose `User` schema is defined with `select: false`.

### 2.2 JWT & Cookie-Based Session Architecture
- **No LocalStorage Token Storage:** Storing access tokens in browser `localStorage` or `sessionStorage` exposes sessions to Cross-Site Scripting (XSS) extraction. MasterJiEstates strictly mandates **HTTP-only cookies** as the primary authentication strategy.
- **Cookie Security Attributes:**
  ```javascript
  const cookieOptions = {
    httpOnly: true,                                       // Inaccessible to JavaScript (document.cookie)
    secure: process.env.NODE_ENV === 'production',        // Transmitted exclusively over HTTPS
    sameSite: 'lax',                                      // Defends against CSRF in cross-site navigations
    domain: process.env.NODE_ENV === 'production' 
      ? '.masterjiestates.in'                             // Shared across apex and api subdomains
      : undefined,
    maxAge: rememberMe 
      ? 7 * 24 * 60 * 60 * 1000                           // 7 days
      : 24 * 60 * 60 * 1000                               // 1 day
  };
  ```

### 2.3 Session Expiration & Revocation Strategy
- **JWT Payload Minimization:** Tokens encode only the minimal identity context: `{ id: user._id, role: user.role, tokenVersion: user.tokenVersion }`.
- **Global Invalidation (Token Versioning):** When a user changes their password, executes a password reset, or is suspended by an administrator, the `tokenVersion` counter on the user document increments, immediately invalidating all existing signed cookies across all devices.

---

## 3. Server-Side Role-Based & Object-Level Access Control

### 3.1 Defense-in-Depth Admin Protection
- **No Client-Side Reliance:** Hiding the `/admin` link in the React sidebar is purely cosmetic. The Express backend evaluates every admin request through the `verifyAdmin` middleware:
  ```javascript
  export const verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Forbidden: Administrative privileges required'
      });
    }
    next();
  };
  ```
- **Immunity from Privilege Escalation:**
  - `POST /api/v1/auth/register` explicitly forces `role: 'user'`.
  - `PUT /api/v1/users/profile` whitelists mutable fields; `role` is systematically stripped.
  - Public registration will **never** create an administrator account.

### 3.2 Secure Admin Bootstrapping
Initial administrator creation cannot be executed through any HTTP API. It is performed via a dedicated CLI script requiring direct server terminal access and an environment-isolated master secret:
```bash
# Executed via SSH / secure container terminal
node server/scripts/seedAdmin.js \
  --email="admin@masterjiestates.in" \
  --password="$TEMPORARY_INITIAL_PASSWORD" \
  --masterKey="$ADMIN_SEED_SECRET_KEY"
```

### 3.3 Mitigation of Insecure Direct Object References (IDOR)
Any operation mutating or viewing private records enforces Attribute-Based Access Control (ABAC):
- **Property Mutation:** `property.ownerId.equals(req.user._id) || req.user.role === 'admin'`.
- **Enquiry Access:** Users can only query enquiries where `userId.equals(req.user._id)`.
- **Site Visit Cancellation:** Users can only cancel visits matching their own `userId`.

---

## 4. Information Leak Prevention & Data Privacy

### 4.1 Owner PII Protection (Brokerage Model)
- **Problem:** Malicious scrapers harvest property owner phone numbers from open real estate classifieds.
- **Architectural Solution:**
  1. The `address` and `ownerId` fields on the `Property` schema are set to `select: false` by default.
  2. Public API serialization layers transform the property payload, injecting the official MasterJiEstates helpline:
     ```javascript
     // Transformation DTO
     export const toPublicPropertyDTO = (property) => ({
       id: property._id,
       title: property.title,
       slug: property.slug,
       price: property.price,
       city: property.city,
       locality: property.locality,
       areaSqFt: property.areaSqFt,
       category: property.category,
       listingType: property.listingType,
       specs: property.specs,
       amenities: property.amenities,
       images: property.images,
       contactHelpline: "+91 98765 43210", // MasterJiEstates central office
       contactEmail: "info@masterjiestates.in"
     });
     ```

### 4.2 Financial Confidentiality (Company-Owned Model)
- **Problem:** Exposing acquisition costs or profit margins erodes negotiation leverage and exposes business margins to competitors.
- **Architectural Solution:**
  - Company acquisition costs are stored in the completely separate `purchases` collection.
  - Renovation and holding CapEx are stored in the `expenses` collection.
  - Zero endpoints in `/api/v1/properties/*` perform joins or aggregations against `purchases` or `expenses`.
  - Financial routes are nested strictly under `/api/v1/admin/portfolio/*` behind `verifyAdmin`.

---

## 5. Network, Cross-Origin & Input Defense

### 5.1 Cross-Origin Resource Sharing (CORS)
CORS is restricted to authorized company origins with explicit credential allowance:
```javascript
const allowedOrigins = [
  'https://masterjiestates.in',
  'https://www.masterjiestates.in',
  'http://localhost:5173'
];
```

### 5.2 Multi-Tier Rate Limiting
Configured using `express-rate-limit` to mitigate DoS, brute force, and automated lead spam:

| Endpoint Domain | Rate Limit Rule | Action Upon Exceeding |
| :--- | :--- | :--- |
| **Authentication** (`/api/v1/auth/login`) | 5 failed attempts / 15 minutes / IP | `429 Too Many Requests`: Account login throttled. |
| **Registration** (`/api/v1/auth/register`) | 5 requests / 1 hour / IP | `429 Too Many Requests`: Registration throttled. |
| **Enquiry Submission** (`/api/v1/enquiries`) | 5 enquiries / 1 hour / IP | `429 Too Many Requests`: Lead submission throttled. |
| **General Public API** | 100 requests / 1 minute / IP | Temporary request back-off. |

### 5.3 Input Sanitization & Anti-Injection
1. **NoSQL Injection:** `express-mongo-sanitize` strips any object keys containing forbidden characters (`$` or `.`).
2. **Cross-Site Scripting (XSS):** HTML input sanitization (`sanitize-html`) cleans all user-submitted rich text.
3. **HTTP Parameter Pollution:** `hpp` middleware defends against multiple parameter array injection.

---

## 6. Secure Error Handling & Audit Readiness

1. **Stack Trace Masking:** In production (`NODE_ENV === 'production'`), error stack traces are suppressed, returning only structured, human-readable status codes and messages.
2. **Audit Logging:** Security-critical events (`LOGIN_FAILED`, `ADMIN_PROMOTION_ATTEMPT`, `PROPERTY_DELETED`, `PERMISSION_DENIED`) write structured events into `auditLogs` capturing actor, action, target, IP address, and timestamp.

