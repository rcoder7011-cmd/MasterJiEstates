# MasterJiEstates — API Architecture & Endpoint Specification

---

## 1. RESTful Design Principles & Protocol Standards

1. **Protocol & Versioning:** All endpoints are served over HTTPS under the path `/api/v1`.
2. **Predictable JSON Envelopes:**
   - **Success Envelope:**
     ```json
     {
       "success": true,
       "statusCode": 200,
       "message": "Resource retrieved successfully",
       "data": {},
       "meta": { "total": 48, "page": 1, "limit": 12, "totalPages": 4 }
     }
     ```
   - **Error Envelope:**
     ```json
     {
       "success": false,
       "statusCode": 400,
       "message": "Validation failed: Phone number must be a valid 10-digit Indian mobile number",
       "errors": [
         { "field": "phone", "message": "Invalid format" }
       ]
     }
     ```
3. **HTTP Status Code Mapping:**
   - `200 OK`: Successful read or update.
   - `201 Created`: Resource successfully created.
   - `400 Bad Request`: Malformed JSON or syntax failure.
   - `401 Unauthorized`: Missing or invalid session token.
   - `403 Forbidden`: Authenticated user lacks required role or resource ownership.
   - `404 Not Found`: Target entity does not exist.
   - `409 Conflict`: Unique constraint violation (e.g., duplicate email/phone).
   - `422 Unprocessable Entity`: Semantic validation failure.
   - `429 Too Many Requests`: Rate limit triggered.
   - `500 Internal Server Error`: Unhandled server exception.

---

## 2. Module 1: Authentication & Session (`/api/v1/auth`)

| Method | Endpoint | Purpose | Auth | Role | Request Payload | Response Data | Error Codes |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user | Public | Any | `{ name, email, password, phone }` | `{ user: { _id, name, email, phone, role } }` + `Set-Cookie` | `400, 409, 422, 429` |
| `POST` | `/api/v1/auth/login` | Authenticate user | Public | Any | `{ email, password, rememberMe }` | `{ user: { _id, name, email, phone, role } }` + `Set-Cookie` | `400, 401, 403, 429` |
| `POST` | `/api/v1/auth/logout` | Terminate session | Required | User/Admin | None | `{ message: "Logged out successfully" }` + Clear Cookie | `401` |
| `GET` | `/api/v1/auth/me` | Fetch active profile | Required | User/Admin | None | `{ user: { _id, name, email, phone, role, preferences } }` | `401` |
| `POST` | `/api/v1/auth/forgot-password`| Request reset email | Public | Any | `{ email }` | `{ message: "Password reset link dispatched" }` | `400, 429` |
| `PATCH`| `/api/v1/auth/reset-password/:token`| Reset password | Public | Any | `{ password }` | `{ message: "Password updated successfully" }` | `400, 422` |

---

## 3. Module 2: User Profile Management (`/api/v1/users`)

| Method | Endpoint | Purpose | Auth | Role | Request Payload | Response Data | Error Codes |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/users/profile` | Get full profile | Required | User/Admin | None | `{ profile: { name, email, phone, preferences, createdAt } }` | `401` |
| `PUT` | `/api/v1/users/profile` | Update profile | Required | User/Admin | `{ name, phone, preferences }` (Whitelisted fields only) | `{ updatedProfile: { ... } }` | `400, 422` |
| `PATCH`| `/api/v1/users/change-password`| Update password | Required | User/Admin | `{ currentPassword, newPassword }` | `{ message: "Password changed successfully" }` | `400, 401, 422` |

---

## 4. Module 3: Properties — Public Discovery (`/api/v1/properties`)

| Method | Endpoint | Purpose | Auth | Role | Query Parameters / Payload | Response Data |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `GET` | `/api/v1/properties` | Catalogue search & filter | Public | Any | `?city=&category=&minPrice=&maxPrice=&listingType=&bhk=&sort=&page=&limit=` | Array of property cards (Public DTO: owner details stripped) + `meta` |
| `GET` | `/api/v1/properties/featured` | Homepage featured listings | Public | Any | `?limit=6` | Array of featured property cards |
| `GET` | `/api/v1/properties/:slug` | Full property details | Public | Any | URL param `:slug` | Complete public property object (photos, specs, amenities, MasterJi contact badge) |
| `GET` | `/api/v1/properties/:id/similar`| Related properties | Public | Any | URL param `:id` | Array of 4 similar category/city listings |

---

## 5. Module 4: Properties — Seller Management (`/api/v1/user/properties`)

| Method | Endpoint | Purpose | Auth | Role | Request Payload | Security / ABAC Rule |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `GET` | `/api/v1/user/properties` | View own listings | Required | User | Query `?status=&page=` | Returns listings where `ownerId === req.user._id` |
| `POST` | `/api/v1/user/properties` | Submit new listing | Required | User | Category specs, location, price, photos | Injects `ownerId: req.user._id`, `status: 'pending_review'`, `listingType: 'brokerage'` |
| `GET` | `/api/v1/user/properties/:id` | View own listing detail | Required | User | None | Verified via `verifyPropertyOwnership` |
| `PUT` | `/api/v1/user/properties/:id` | Edit own listing | Required | User | Updated details | Only permitted if status is `draft` or `rejected`. If `approved`, reverts to `pending_review`. |
| `PATCH`| `/api/v1/user/properties/:id/withdraw`| Withdraw listing | Required | User | `{ reason }` | Verified via `verifyPropertyOwnership`; marks status `withdrawn`. |

---

## 6. Module 5: Favourites (`/api/v1/favourites`)

| Method | Endpoint | Purpose | Auth | Role | Request Payload | Response Data |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `GET` | `/api/v1/favourites` | List user favorites | Required | User | `?page=&limit=` | Array of populated property cards |
| `POST` | `/api/v1/favourites/toggle` | Toggle favorite | Required | User | `{ propertyId }` | `{ isFavourited: Boolean }` |

---

## 7. Module 6: Enquiries & Leads (`/api/v1/enquiries`)

| Method | Endpoint | Purpose | Auth | Role | Request Payload | Response Data |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `POST` | `/api/v1/enquiries` | Submit property enquiry | Public/Auth | Any | `{ propertyId, name, phone, email, message }` | `{ message: "Enquiry submitted successfully", enquiryId }` |
| `GET` | `/api/v1/enquiries/my` | View user submitted enquiries | Required | User | `?page=&limit=` | Array of enquiries with target property info and response status |

---

## 8. Module 7: Site Visits (`/api/v1/site-visits`)

| Method | Endpoint | Purpose | Auth | Role | Request Payload | Response Data |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `POST` | `/api/v1/site-visits` | Request site visit | Required | User | `{ propertyId, preferredDate, preferredTimeSlot, notes }` | `{ visit: { _id, status, preferredDate, timeSlot } }` |
| `GET` | `/api/v1/site-visits/my` | View user visits | Required | User | `?status=` | Array of visits with schedule and status |
| `PATCH`| `/api/v1/site-visits/:id/cancel`| Cancel visit | Required | User | `{ cancellationReason }` | ABAC verified; marks status `cancelled` |

---

## 9. Module 8: Notifications (`/api/v1/notifications`)

| Method | Endpoint | Purpose | Auth | Role | Request Payload | Response Data |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `GET` | `/api/v1/notifications` | Get user notifications | Required | User/Admin | `?unreadOnly=true` | Array of notifications + unread count |
| `PATCH`| `/api/v1/notifications/:id/read`| Mark single read | Required | User/Admin | None | `{ success: true }` |
| `PATCH`| `/api/v1/notifications/read-all`| Mark all read | Required | User/Admin | None | `{ markedCount: Number }` |

---

## 10. Module 9: Admin — Property Moderation & Management (`/api/v1/admin/properties`)

| Method | Endpoint | Purpose | Auth | Role | Request Payload | Response / Action |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `GET` | `/api/v1/admin/properties/pending` | Review queue | Required | Admin | `?page=&category=` | Full unmasked property submissions with owner PII |
| `PATCH`| `/api/v1/admin/properties/:id/approve`| Approve listing | Required | Admin | `{ verificationNotes }` | Sets `status: 'approved' -> 'available'`; notifies owner |
| `PATCH`| `/api/v1/admin/properties/:id/reject` | Reject listing | Required | Admin | `{ reason, remarks }` | Sets `status: 'rejected'`; sends feedback to owner |
| `PATCH`| `/api/v1/admin/properties/:id/feature`| Toggle featured flag| Required | Admin | `{ isFeatured: Boolean }` | Updates homepage placement |
| `DELETE`| `/api/v1/admin/properties/:id` | Soft delete property | Required | Admin | `{ deletionReason }` | Marks status `withdrawn`; archives records |

---

## 11. Module 10: Admin — CRM, Leads & Site Visits (`/api/v1/admin/crm`)

| Method | Endpoint | Purpose | Auth | Role | Request Payload | Response / Action |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `GET` | `/api/v1/admin/enquiries` | Global enquiry inbox | Required | Admin | `?status=&propertyId=&page=`| Complete lead list with customer contact details |
| `PATCH`| `/api/v1/admin/enquiries/:id/assign`| Assign lead to staff | Required | Admin | `{ assignedStaffId }` | Sets staff owner for follow-up |
| `PATCH`| `/api/v1/admin/enquiries/:id/status`| Update lead stage | Required | Admin | `{ status, note }` | Appends note to `adminNotes` and updates stage |
| `GET` | `/api/v1/admin/site-visits` | Global visit schedule| Required | Admin | `?date=&status=` | Dispatch calendar of all scheduled visits |
| `PATCH`| `/api/v1/admin/site-visits/:id/confirm`| Confirm & dispatch | Required | Admin | `{ assignedStaffId, meetingPoint }` | Notifies buyer with field executive details |
| `PATCH`| `/api/v1/admin/site-visits/:id/complete`| Log visit outcome | Required | Admin | `{ outcome, feedback, executiveNotes }` | Closes site visit and logs buyer interest |

---

## 12. Module 11: Admin — Deals & Brokerage Commissions (`/api/v1/admin/deals`)

| Method | Endpoint | Purpose | Auth | Role | Request Payload | Response / Action |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `POST` | `/api/v1/admin/deals` | Record closed deal | Required | Admin | `{ propertyId, buyerId, finalAgreedPrice, dealDate, commissionRatePercent }` | Creates deal, marks property `sold`, initializes commission invoice |
| `GET` | `/api/v1/admin/commissions` | Commission ledger | Required | Admin | `?paymentStatus=&page=` | Full list of commission receivables and settlements |
| `POST` | `/api/v1/admin/commissions/:id/payment`| Record commission receipt | Required | Admin | `{ amount, mode, referenceNo, receivedDate }` | Updates cumulative received amount, adjusts status to `settled` or `partial` |

---

## 13. Module 12: Admin — Company Asset Portfolio & Financials (`/api/v1/admin/portfolio`)

| Method | Endpoint | Purpose | Auth | Role | Request Payload | Response / Action |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `POST` | `/api/v1/admin/portfolio/purchase` | Onboard company asset | Required | Admin | Property specs + `{ purchasePrice, stampDuty, legalFees, sellerDetails }` | Creates property record (`company_owned`) and logs acquisition record in `purchases` |
| `POST` | `/api/v1/admin/portfolio/:id/expenses`| Record CapEx item | Required | Admin | `{ expenseType, amount, expenseDate, vendorName, receiptUrl, notes }` | Logs expense in `expenses` collection |
| `GET` | `/api/v1/admin/portfolio/:id/financials`| Asset financial summary | Required | Admin | URL param `:id` | Returns Acquisition Base + Total CapEx + Projected/Realized Profit |

---

## 14. Module 13: Admin — User Management & Analytics (`/api/v1/admin/users`, `/api/v1/admin/analytics`)

| Method | Endpoint | Purpose | Auth | Role | Request Payload / Params |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/admin/users` | User directory | Required | Admin | `?role=&search=&page=&limit=` |
| `PATCH`| `/api/v1/admin/users/:id/suspend`| Toggle suspension | Required | Admin | `{ isSuspended: Boolean, reason: String }` |
| `GET` | `/api/v1/admin/analytics/overview`| Executive metrics | Required | Admin | `?timeframe=monthly` |
| `GET` | `/api/v1/admin/analytics/revenue` | Financial metrics | Required | Admin | Commissions vs Company Resale Margins |

---

## 15. Module 14: Website Content CMS (`/api/v1/content`)

| Method | Endpoint | Purpose | Auth | Role | Payload |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/content/settings` | Public website settings | Public | Any | Returns company profile, banners, testimonials, social links |
| `PUT` | `/api/v1/admin/content/settings`| Update website settings | Required | Admin | CMS payload (banners, partner disclaimers, contact details) |

