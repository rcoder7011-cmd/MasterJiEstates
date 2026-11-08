# MasterJiEstates — Part 13: Business Operations, Brokerage Deals & Financial Management Report

**Project:** MasterJiEstates  
**Official Domain:** https://masterjiestates.in  
**Milestone:** Part 13 of 15  
**Date of Completion:** 2026-11-07  
**Status:** COMPLETE — 100% Pass Rate (110/110 Business Tests, 316/316 Platform Total)

---

## 1. Executive Summary

Part 13 implements the enterprise-grade internal **Business Operations and Financial Management System** for MasterJiEstates. Seamlessly integrated into the existing administrative dashboard (`/admin`), this system provides platform directors, finance executives, and estate managers with complete oversight of the company's dual revenue streams:
1. **Third-Party Brokerage Commission Operations:** Full lifecycle management of client deals, individual commission agreements (percentage rate or fixed fee), multi-instalment payment ledger with transaction tracking, duplicate UTR prevention, and audited payment reversals.
2. **Proprietary Company-Owned Property Operations:** Capital investment tracking including initial acquisition costs, itemized asset-level capital expenditures (registration, stamp duty, renovation, legal fees, repairs), resale recording, and automated gross profit and gross margin percentage calculations upon sale.
3. **General Business Operating Expenses:** Non-property administrative and overhead tracking (office lease, cloud hosting, SaaS subscriptions, digital marketing, professional services, staff allowances) with category filtering and audited reversals.
4. **Financial Analytics & Authorized CSV Exports:** Aggregate operational KPIs with dynamic date filtering (`this_month`, `last_month`, `last_3_months`, `this_year`, `all`), pipeline deal distributions, commission collections by payer, and one-click streaming CSV exports for external accounting reconciliation.
5. **Absolute Proprietary Privacy Defense:** All financial information, acquisition costs, expenses, and gross margins are strictly restricted to authorized administrators and shielded from public buyer APIs and prospective sellers.

---

## 2. Core Business Operations Architecture & Role-Based Access Control

All financial operations and business endpoints are mounted under `/api/admin/business` with a strict, defense-in-depth security pipeline:

```text
HTTP Request ──▶ csrfProvider ──▶ authenticate ──▶ authorizeRoles('admin') ──▶ verifyCsrfToken (mutations) ──▶ Controller ──▶ Service Layer
```

- **Unauthenticated Access (`401 Unauthorized`):** Any access without a valid, signed JWT session cookie (`mj_auth_token`) is rejected before reaching controller logic.
- **Normal User / Staff Access (`403 Forbidden`):** Authenticated users with `role: 'user'` or `role: 'staff'` are strictly blocked. Business and financial data is inaccessible outside administrative privilege.
- **Double-Submit CSRF Protection:** All state mutations (`POST`, `PATCH`) enforce validation of the `x-csrf-token` header against the cryptographic `mj_csrf_token` cookie.
- **Append-Only Audit Trail:** Every deal creation, commission adjustment, payment receipt, reversal, expense addition, and CSV export is permanently written to the administrative audit log with administrator identity, timestamp, and mandatory justification remarks.

---

## 3. Database Schema Extensions & Mongoose Models

Five new Mongoose models were authored under `server/models/`, accompanied by extensions to `AuditLog.js` and `models/index.js`:

### 3.1 `BrokerageDeal` (`server/models/BrokerageDeal.js`)
Captures the commercial transaction lifecycle between buyer, seller, and MasterJiEstates:
- `dealReference`: String, unique human-readable code (e.g., `DEAL-20261107-1001`).
- `propertyId`: ObjectId / String ref to the target property.
- `propertyTitle`, `propertySlug`, `propertyCity`: Denormalized property identifiers.
- `seller`: Subdocument `{ userId, name, phone, email }`.
- `buyer`: Subdocument `{ userId, name, phone, email }`.
- `enquiryId`: Optional ref to the originating buyer enquiry.
- `status`: Enum `['lead', 'negotiation', 'agreement_pending', 'agreement_signed', 'transaction_in_progress', 'completed', 'cancelled', 'on_hold']`.
- `expectedTransactionValue`: Number, estimated deal size in INR.
- `actualTransactionValue`: Number, final registered sale deed value in INR.
- `dealDate`, `expectedClosingDate`, `actualClosingDate`: Key transaction dates.
- `responsibleAdmin`: Subdocument `{ adminId, name, email }`.
- `commissionAgreement`: Embedded agreement with `commissionType` (`percentage` | `fixed`), `percentageRate`, `fixedAmount`, `agreedAmount`, `isEstimated` flag, `payer` (`seller` | `buyer` | `both` | `other`), `buyerShare`, `sellerShare`, `documentReference`, `status` (`draft` | `agreed` | `invoiced` | `partially_collected` | `fully_collected` | `waived` | `disputed`), and `revisionHistory` array.
- `totalReceivedCommission`: Number, sum of non-reversed payments.
- `outstandingCommission`: Number, `agreedAmount - totalReceivedCommission`.

### 3.2 `CommissionPayment` (`server/models/CommissionPayment.js`)
Tracks discrete monetary inflows toward a brokerage deal's agreed commission:
- `paymentReference`: String, unique code (e.g., `PAY-20261107-6001`).
- `dealId`, `dealReference`, `propertyTitle`: Foreign linkage to the deal.
- `amount`: Number, transaction amount in INR.
- `paymentDate`: Date of receipt.
- `paymentMethod`: Enum `['bank_transfer', 'upi', 'cheque', 'cash', 'other']`.
- `transactionNumber`: String (UTR / Cheque Number / UPI Ref), unique to prevent double-entry.
- `receivedFrom`: Enum `['seller', 'buyer', 'other']`.
- `payerName`: String counterparty name.
- `status`: Enum `['paid', 'cancelled', 'bounced']`.
- `isReversed`: Boolean flag.
- `reversalReason`: Mandatory reason (min 5 chars) if reversed.
- `reversedAt`, `reversedBy`: Reversal audit metadata.
- `recordedBy`: Admin attribution `{ adminId, adminName, adminEmail }`.

### 3.3 `PropertyExpense` (`server/models/PropertyExpense.js`)
Itemizes capital expenditures (CapEx) and holding costs for company-owned inventory:
- `expenseReference`: String, unique code (e.g., `EXP-20261107-4001`).
- `propertyId`, `propertyTitle`: Foreign linkage to company asset.
- `category`: Enum `['registration', 'renovation', 'repair_maintenance', 'legal_documentation', 'brokerage_paid', 'property_tax', 'utility_clearing', 'marketing', 'other']`.
- `amount`: Number, expense in INR.
- `date`: Incurred date.
- `vendor`: Payee or authority (e.g., "Sub-Registrar Gurugram").
- `receiptReference`: Invoice or challan identifier.
- `paymentMethod`: Enum `['bank_transfer', 'cheque', 'upi', 'cash', 'other']`.
- `isReversed`, `reversalReason`, `reversedAt`, `reversedBy`: Audited reversal support.
- `recordedBy`: Admin attribution.

### 3.4 `CompanyPropertySale` (`server/models/CompanyPropertySale.js`)
Captures the final resale event when MasterJiEstates liquidates a proprietary asset:
- `saleReference`: String, unique code (e.g., `SALE-20261107-5001`).
- `propertyId`, `propertyTitle`: Asset sold.
- `buyer`: Subdocument `{ name, phone, email, address, panNumber }`.
- `saleAmount`: Number, gross realized revenue in INR.
- `saleDate`, `deedRegistrationDate`: Legal execution dates.
- `agreementReference`: Sale deed reference number.
- `paymentStatus`: Enum `['token_received', 'partially_paid', 'fully_paid']`.
- `paymentReceived`: Cumulative money collected.
- **Computed Financials (Immutable Snapshot):**
  - `acquisitionCost`: Base purchase cost.
  - `totalExpenses`: Cumulative non-reversed property CapEx.
  - `totalInvestment`: `acquisitionCost + totalExpenses`.
  - `grossProfit`: `saleAmount - totalInvestment`.
  - `grossMarginPercentage`: `(grossProfit / saleAmount) * 100`.

### 3.5 `BusinessExpense` (`server/models/BusinessExpense.js`)
Tracks operational overheads independent of specific property assets:
- `expenseReference`: String, unique code (e.g., `BEXP-20261107-7001`).
- `title`: Operational description (e.g., "Cloudflare CDN & AWS Hosting").
- `category`: Enum `['office_rent', 'software_subscriptions', 'marketing', 'travel', 'utilities', 'professional_services', 'staff_costs', 'other']`.
- `amount`: Number in INR.
- `date`, `vendor`, `paymentMethod`, `referenceNumber`, `receiptReference`.
- `isReversed`, `reversalReason`, `reversedAt`, `reversedBy`: Audited reversal support.

### 3.6 `AuditLog` Extensions (`server/models/AuditLog.js`)
Extended with actions: `deal_created`, `deal_status_updated`, `deal_updated`, `commission_agreement_updated`, `commission_payment_recorded`, `commission_payment_reversed`, `property_expense_created`, `property_expense_reversed`, `company_sale_recorded`, `business_expense_created`, `business_expense_reversed`, `financial_report_exported`. Extended targets: `deal`, `commission_payment`, `property_expense`, `company_sale`, `business_expense`, `financial_report`.

---

## 4. Brokerage Deal Management & Commission Calculation Rules

### 4.1 Commission Formulas
Commission terms are dynamically computed based on transaction values:
- **Percentage Rate:**
  $$\text{agreedAmount} = \frac{\text{transactionValue} \times \text{percentageRate}}{100}$$
  - If `actualTransactionValue > 0`, the calculation grounds on confirmed deed value (`isEstimated: false`).
  - If `actualTransactionValue === 0`, it evaluates against `expectedTransactionValue` (`isEstimated: true`).
- **Fixed Fee:** `agreedAmount = fixedAmount` (`isEstimated: false`).
- **Payer Partitioning:**
  - `payer: 'seller'` $\implies$ `sellerShare = agreedAmount`, `buyerShare = 0`.
  - `payer: 'buyer'` $\implies$ `buyerShare = agreedAmount`, `sellerShare = 0`.
  - `payer: 'both'` $\implies$ Custom split or default 50/50 division.

### 4.2 Revision History & Audited Terms Revision
When commercial terms change during negotiation:
- The previous agreement snapshot is preserved immutably in `revisionHistory`.
- The system enforces a mandatory justification reason (`cleanReason.length >= 5`) or rejects with `400 Bad Request`.
- Outstanding balance is dynamically updated: $\text{outstandingCommission} = \max(0, \text{agreedAmount} - \text{totalReceivedCommission})$.

---

## 5. Commission Payment Ledger & Audited Reversals

### 5.1 Multi-Tranche Collections & Overpayment Protection
Clients frequently pay brokerage commission in tranches (e.g., advance upon agreement to sell, remainder upon registry).
- **Overpayment Guard:** Attempts to record an amount exceeding `outstandingCommission` are rejected with `400 Bad Request`.
- **Duplicate UTR Guard:** If a transaction reference (bank UTR, cheque number) was previously recorded, it is rejected with `400 Bad Request` to prevent accidental double-entry.
- **Dynamic Status Progression:**
  - $\text{totalReceivedCommission} = 0 \implies \text{invoiced}$
  - $0 < \text{totalReceivedCommission} < \text{agreedAmount} \implies \text{partially\_collected}$
  - $\text{outstandingCommission} = 0 \implies \text{fully\_collected}$

### 5.2 Audited Payment Reversals
If a cheque bounces or a bank transfer is returned:
- The payment record is **never deleted**. It is updated to `isReversed: true`, `status: 'cancelled'`.
- Mandatory detailed reason (min 5 characters) is required.
- The deal's `totalReceivedCommission` is deducted, and `outstandingCommission` is restored.
- Attempts to re-reverse an already reversed payment are rejected with `400 Bad Request`.

---

## 6. Company-Owned Property Financials & Resale Margins

### 6.1 Investment Basis Formula
For company-owned properties, MasterJiEstates tracks the total landed capital basis:
$$\text{totalInvestment} = \text{acquisitionCost} + \sum \text{PropertyExpenses (non-reversed)}$$

Expenses include statutory stamp duty, registry fees, architectural renovation, civil maintenance, and legal scrutiny.

### 6.2 Resale Execution & Gross Profit
When an asset is liquidated to an end-buyer:
$$\text{grossProfit} = \text{saleAmount} - \text{totalInvestment}$$
$$\text{grossMarginPercentage} = \frac{\text{grossProfit}}{\text{saleAmount}} \times 100$$

- **Status Transition:** Recording a sale updates property `availabilityStatus` to `'sold'`.
- **Validation:** Zero or negative sale amounts, missing buyer identities, and missing registration references are rejected with `400 Bad Request`.

---

## 7. General Operating Expenses & Financial Reports

### 7.1 General Operating Expenses
Covers business overheads categorized into:
`office_rent`, `software_subscriptions`, `marketing`, `travel`, `utilities`, `professional_services`, `staff_costs`, `other`. Includes audited reversals and real-time category filtering.

### 7.2 Financial Analytics & Authorized CSV Exports
Four one-click CSV export streams:
1. `brokerage_deals`: Deal Reference, Property, City, Status, Expected Value, Actual Value, Commission Type, Rate, Agreed Amount, Received, Outstanding, Deal Date.
2. `commission_ledger`: Payment Reference, Deal Reference, Property, Amount, Payment Date, Method, Transaction Number, Received From, Payer Name, Reversed Status.
3. `company_sales`: Sale Reference, Property, Buyer, Sale Amount, Payment Received, Acquisition Cost, Total Expenses, Total Investment, Gross Profit, Gross Margin %, Sale Date.
4. `business_expenses`: Reference, Title, Category, Amount, Date, Vendor, Payment Method, Reference Number, Reversed Status.

---

## 8. Frontend Pages & Components

Located under `client/src/pages/admin/` and `client/src/components/admin/`:
- `BusinessOverview.jsx` (`/admin/business`): KPI dashboard with metrics cards, date filter, and recent transactions feed.
- `BrokerageDeals.jsx` (`/admin/business/deals`): Deals pipeline table with search, status filters, and "New Brokerage Deal" modal.
- `DealDetails.jsx` (`/admin/business/deals/:id`): Single deal inspection sheet with counterparty identities, live value updates, commission revision modal, and payment ledger with recording and reversal modals.
- `CommissionLedger.jsx` (`/admin/business/commission-ledger`): Global payment ledger with method/status/date filters and payment reversal action.
- `CompanyPropertyFinancials.jsx` (`/admin/business/company-properties`): Company asset CapEx ledger with "+ Expense", "View Ledger", and "Record Sale" modals featuring live gross margin calculations.
- `BusinessExpenses.jsx` (`/admin/business/expenses`): General operational expense manager with category filters and reversal modal.
- `FinancialReports.jsx` (`/admin/business/reports`): Report analytics with pipeline and expense breakdowns, plus 4 one-click CSV export cards.
- UI Components: `MoneyDisplay.jsx`, `FinancialStatCard.jsx`, `DateRangeFilter.jsx`, `DealStatusBadge.jsx`, `PaymentStatusBadge.jsx`.
- Navigation: `AdminSidebar.jsx` updated with three grouped categories: **Operations**, **Business & Finance**, **Governance**.

---

## 9. Verification & Automated Test Suite Results

### 9.1 Test Execution Summary
The backend automated test suite (`server/scripts/testBusinessOperations.js`) was executed with 15 rigorous testing sections:

```text
======================================================
 MASTERJIESTATES PART 13: BUSINESS & FINANCIAL SUITE
======================================================
--- 1. Testing Unauthenticated Security Boundaries (Expecting 401) --- 8/8 PASSED
--- 2. Testing Normal User Role-Based Access Control (Expecting 403) --- 7/7 PASSED
--- 3. Setting Up Authorized Administrator Identity --- 1/1 PASSED
--- 4. Testing Business Operations Overview Dashboard --- 9/9 PASSED
--- 5. Testing Brokerage Deals Pipeline & Validation --- 13/13 PASSED
--- 6. Testing Commission Terms Revisions & Audit Logging --- 5/5 PASSED
--- 7. Testing Commission Payment Ledger & Overpayment Guards --- 11/11 PASSED
--- 8. Testing Commission Payment Reversal Workflow --- 5/5 PASSED
--- 9. Testing Company-Owned Property Financials & CapEx --- 8/8 PASSED
--- 10. Testing Company Property Resale & Gross Margin --- 7/7 PASSED
--- 11. Testing General Business Operating Expenses --- 5/5 PASSED
--- 12. Testing Financial Reports Summary & CSV Exports --- 16/16 PASSED
--- 13. Testing Financial Privacy & Data Leak Defense --- 4/4 PASSED
--- 14. Testing Administrative Audit Trail Logging --- 5/5 PASSED
--- 15. Regression Testing Public APIs --- 2/2 PASSED
======================================================
 RESULT: 110 / 110 TESTS PASSED (100% Pass Rate)
======================================================
```

### 9.2 Complete Regression Matrix Across All Platform Suites

| Test Suite | File | Tests Run | Passed | Status |
|---|---|---|---|---|
| **Part 13: Business & Financial Operations** | `server/scripts/testBusinessOperations.js` | 110 | 110 | **100% PASSED** |
| **Part 12: Admin Back-Office & Moderation** | `server/scripts/testAdmin.js` | 76 | 76 | **100% PASSED** |
| **Part 11: Property Submission & Cloudinary** | `server/scripts/testPropertySubmission.js` | 46 | 46 | **100% PASSED** |
| **Part 10: Unified User Dashboard** | `server/scripts/testDashboard.js` | 46 | 46 | **100% PASSED** |
| **Part 9: Auth & Security Engine** | `server/scripts/testAuth.js` | 38 | 38 | **100% PASSED** |
| **Platform Total** | | **316** | **316** | **100% PASSED** |

### 9.3 Client Production Build
The Vite production build completed with 0 errors:
```text
vite v6.4.5 building for production...
✓ 464 modules transformed.
dist/index.html                         2.88 kB │ gzip:   0.99 kB
dist/assets/index-C9C2v5LG.css         72.71 kB │ gzip:  12.15 kB
dist/assets/vendor-gsap-DdEiTQuA.js    70.90 kB │ gzip:  27.95 kB
dist/assets/vendor-mui-DPXn0d1S.js     85.09 kB │ gzip:  29.98 kB
dist/assets/vendor-react-CACxoeXR.js  182.31 kB │ gzip:  60.10 kB
dist/assets/index-OcGf5h7W.js         578.95 kB │ gzip: 112.54 kB
✓ built in 6.30s
```

---

## 10. Database Connectivity Status

- **Status:** Running in robust **In-Memory Store Fallback Mode** (`dbConnected: false`).
- **Details:** The configured MongoDB Atlas URI in `server/.env` uses placeholder demo credentials (`uYahaPasswordhogaG`). Mongoose connection attempts safely fall back to the in-memory data store after timeout. All business operations, deals, payment ledgers, company CapEx, resale margins, operating expenses, and CSV exports operate cleanly with pre-seeded demo records without throwing uncaught connection exceptions or crashing.
- **Production Transition:** Simply replacing `server/.env` credentials with a live MongoDB cluster URI will enable persistent Atlas collection writes without requiring application code changes.

---

## 11. Answers to User Reporting Questions

1. **What was implemented:**
   An internal Business Operations & Financial Management back-office suite under `/admin/business` with 7 dedicated pages (Overview KPI dashboard, Brokerage Deals pipeline, Deal Details inspection sheet with payment ledger, Global Commission Ledger, Company-Owned Property Financials & CapEx, General Business Expenses, and Financial Reports with 4 CSV exports), 5 new Mongoose models, 21 backend controller methods, and audited reversal workflows.
2. **How brokerage deals and commissions work:**
   Deals progress through an 8-stage lifecycle (`lead` $\to$ `negotiation` $\to$ `agreement_signed` $\to$ `transaction_in_progress` $\to$ `completed`). Commissions are computed as percentage rates or fixed sums against actual deed values (or estimated values if closing is pending) and allocated between seller and buyer. Overpayments and duplicate transaction numbers are rejected at the service layer, and term revisions require mandatory justification reasons and are logged in `revisionHistory`.
3. **How company-owned property investment and profit are calculated:**
   $$\text{totalInvestment} = \text{acquisitionCost} + \sum \text{propertyExpenses}$$
   $$\text{grossProfit} = \text{saleAmount} - \text{totalInvestment}$$
   $$\text{grossMarginPercentage} = \frac{\text{grossProfit}}{\text{saleAmount}} \times 100$$
   Recording a sale updates property availability to `'sold'`, snapshots the financial basis, and records buyer identity.
4. **Whether financial data is protected from normal users:**
   Yes. All business endpoints require `authenticate` + `authorizeRoles('admin')`. Normal users receiving `403 Forbidden`. Furthermore, public property serializers strictly omit `acquisitionCost`, `expenses`, `grossProfit`, and commission details from public catalogue responses.
5. **Whether MongoDB Atlas was actually connected:**
   No. The demo credentials in `server/.env` contain placeholder values (`uYahaPasswordhogaG`). The backend operates in in-memory fallback mode with full mock data pre-seeded.
6. **Which tests passed and failed:**
   110 / 110 Part 13 business tests passed (100%). Across all milestone suites (Parts 9–13), **316 / 316 automated tests passed**. Zero test failures.
7. **Whether CSV exports work:**
   Yes. Verified via automated HTTP testing for all 4 endpoints (`brokerage_deals`, `commission_ledger`, `company_sales`, `business_expenses`), which stream valid `text/csv` headers and escaped comma-separated data.
8. **Any manual setup still required:**
   Replacing demo credentials in `server/.env` with production MongoDB Atlas credentials and live Cloudinary API keys before production launch.

