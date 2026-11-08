# MasterJiEstates — Business Requirements Document (BRD)

---

## 1. Business Context & Strategic Purpose

MasterJiEstates is structured to solve the trust deficit, privacy violations, and transaction inefficiencies prevalent in the Indian real estate market. The business operates on two core pillars:
1. **Full-Service Property Brokerage:** Acting as an exclusive or mandated intermediary between property sellers and genuine buyers, charging a professional brokerage fee upon successful transaction closing.
2. **Proprietary Real Estate Trading & Portfolio Management (Company-Owned):** Acquiring high-potential real estate assets directly, enhancing them where necessary, and retailing them to end buyers with clean titles and zero brokerage friction.

---

## 2. Core Business Models

### 2.1 Model A: Brokerage Properties

```
[Property Owner] 
       │ 1. Submits Listing + Documents
       ▼
[MasterJi Review Queue] 
       │ 2. Legal / Physical Verification by Admin
       ├─────────────────────────┐
       ▼ (Pass)                  ▼ (Fail)
[Approved & Listed]       [Rejected with Feedback]
       │ 3. Public Display with MasterJi Contact Only
       ▼
[Buyer Enquires / Requests Site Visit]
       │ 4. MasterJi Staff Coordinates Visit
       ▼
[Price Negotiation Mediated by MasterJi]
       │ 5. Agreement & Legal Drafting
       ▼
[Deal Closed & Deed Registered]
       │ 6. Commission Invoiced & Collected
       ▼
[Brokerage Revenue Realized]
```

#### Detailed Operational Rules & Mandates:
1. **Absolute PII Privacy:**
   - Under no circumstances shall an owner's personal telephone number, email, or exact residential identifier be visible to visitors or buyers.
   - All public inquiries are routed to the central MasterJiEstates support helpline (`+91 ...`) and corporate email (`info@masterjiestates.in`).
2. **Written Brokerage Mandate:**
   - Prior to public activation, an explicit brokerage mandate or digital service agreement is verified, defining:
     - The agreed commission percentage (typically 1% to 2% for residential, 2% or higher for commercial/plots).
     - Minimum reserve price authorized by the owner.
     - Validity period of the brokerage listing.
3. **Admin Mediation & Pipeline Tracking:**
   - MasterJiEstates operations team owns the customer lifecycle:
     - Lead qualification (filtering out spam and unvetted enquiries).
     - Site visit accompaniment by MasterJiEstates field executives.
     - Bilateral negotiations between buyer and seller.
     - Coordination of stamp duty, registry, and title transfer documentation.
4. **Deal & Commission Settlement:**
   - Upon execution of the registered sale deed, the agreed commission is logged into the administrative ledger, an invoice is generated, and payment status (`pending`, `partial`, `settled`) is tracked.

---

### 2.2 Model B: Company-Owned Properties

```
[MasterJi Investment Desk]
       │ 1. Direct Acquisition from Market
       ▼
[Title Clearance & Due Diligence]
       │ 2. Full Registry in MasterJi / Corporate Name
       ▼
[Internal Asset Onboarding]
       │ 3. Log Purchase Price, Stamp Duty, Legal Fees, CapEx
       ▼
[Catalogue Publication]
       │ 4. Published with "MasterJi Direct / Company-Owned" Badge
       ▼
[Direct Buyer Engagement]
       │ 5. Direct Negotiation (No Brokerage Fee for Buyer)
       ▼
[Sale Deed Registered to Buyer]
       │ 6. Final Sale Revenue Inflow
       ▼
[Financial Ledger Calculation]
       Sale Price - (Purchase Cost + Capital Expenditure + Holding Costs) = Net Profit
```

#### Detailed Operational Rules & Mandates:
1. **Clear Differentiation in Catalogue:**
   - Company-owned properties must feature a distinct visual badge (e.g., `MasterJi Direct | Zero Brokerage | 100% Title Verified`).
   - Signals premium confidence to buyers, indicating immediate availability and clear, single-point legal ownership.
2. **Strict Financial Confidentiality:**
   - Internal acquisition cost, stamp duty expenses, renovation/improvement costs, and projected margin are **never** accessible to public users, registered buyers, or unauthorized staff.
   - These data points are stored in distinct database collections (`purchases`, `expenses`) isolated from public property schemas.
3. **Financial Accounting & Reporting:**
   - The platform must record:
     - Acquisition base price.
     - Ancillary acquisition expenses (registry fees, mutation, legal clearances).
     - Post-acquisition CapEx (repairs, painting, fencing, civil work, architectural staging).
     - Final closing sale price.
     - Realized gross and net profit margins.

---

## 3. Revenue Architecture

MasterJiEstates generates revenue through three primary commercial channels:

| Revenue Channel | Source | Mechanism | Timing of Realization |
| :--- | :--- | :--- | :--- |
| **Brokerage Commission** | External Property Owners & Buyers | Percentage-based commission (1% - 2%) on transaction value | Upon deed registration or key handover |
| **Direct Asset Trading Margins** | Company-Owned Portfolio | Capital appreciation & value-add margin (`Sale Price - Total Cost Basis`) | Upon receipt of property purchase tranches |
| **Ancillary Partner Referral Fees** | Third-party services | Referral commissions for home loan originations, interior design projects, architectural blueprints | Upon partner lead conversion / milestone completion |

---

## 4. Ancillary & Partner Services Strategy

To serve as a comprehensive real estate hub, MasterJiEstates showcases supporting home-building and lifestyle services.

### 4.1 Core Real Estate Services (Operated Directly)
- Residential Property Buying & Selling
- Commercial Land & Building Brokering
- Corporate Leasing & Plot Subdivisions
- Real Estate Portfolio Advisory & Title Verification Assistance

### 4.2 Partner-Provided Supporting Services
To build trust and comply with advertising standards, all partner services are explicitly labeled as partner-facilitated:
- **Home Loan Facilitation:** Partnerships with leading banks/NBFCs to assist buyers with eligibility checks and documentation. *Disclaimer: Loan approvals are subject to bank credit policies; MasterJiEstates does not guarantee approval.*
- **Architectural & Civil Planning:** Vetting certified local architects and structural engineers for plot buyers planning custom homes.
- **Interior Design & Turnkey Fit-Outs:** Connecting property buyers with vetted interior design professionals and modular kitchen specialists.
- **Carpentry & Custom Furniture:** Skilled carpentry partners for on-site woodwork, wardrobes, and furniture installations.
- **Digital & Technology Services:** Digital design and web solutions provided for institutional builders and corporate clients. *Disclaimer: Delivered via specialized affiliate technology teams.*

---

## 5. Regulatory, Compliance & Risk Management

1. **RERA (Real Estate Regulatory Authority) Alignment:**
   - For properties falling under state RERA guidelines (new development projects, large plotted layouts), the RERA registration number and official project details must be captured and prominently displayed.
2. **Consumer Protection & Anti-Fraud:**
   - Listings with suspected forged documents or duplicate claims are blacklisted immediately.
   - Proactive watermarking on all property photographs uploaded to prevent unauthorized scraping by third-party broker networks.
3. **Privacy & Data Protection:**
   - Adherence to the Digital Personal Data Protection (DPDP) Act: User phone numbers, Aadhaar/PAN references, and document scans are encrypted at rest and restricted to super-administrative roles.

---

## 6. Business Success Metrics (KPIs)

| Metric | Target / Benchmark | Business Meaning |
| :--- | :--- | :--- |
| **Listing Time-to-Review** | < 24 Hours | Speed of administrative verification for seller submissions |
| **Catalogue Conversion Rate** | > 3.5% | Percentage of unique property page views that result in an enquiry |
| **Visit-to-Deal Conversion** | > 12% | Ratio of scheduled physical site visits that progress to negotiation/closing |
| **Average Deal Cycle** | < 45 Days | Duration from initial property inquiry to registered deal closure |
| **Commission Realization Rate** | > 98% | Ratio of invoiced brokerage commissions successfully collected |
| **Portfolio Gross Margin** | > 18% | Average margin realized across company-owned property resales |

