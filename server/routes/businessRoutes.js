import { Router } from 'express';
import {
  getOverview,
  getDeals,
  createDeal,
  getDealById,
  updateDeal,
  updateCommission,
  getDealPayments,
  recordPayment,
  reversePayment,
  getCommissionLedger,
  getCompanyProperties,
  getPropertyExpenses,
  recordPropertyExpense,
  reversePropertyExpense,
  getCompanyPropertySale,
  recordCompanyPropertySale,
  getBusinessExpenses,
  recordBusinessExpense,
  reverseBusinessExpense,
  getReportsSummary,
  exportReportCsv,
} from '../controllers/businessController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { csrfProvider, verifyCsrfToken } from '../middleware/csrf.js';

const router = Router();

// CSRF cookie provider
router.use(csrfProvider);

// STRICT ACCESS CONTROL: Only authorized administrators can access financial & business endpoints
router.use(authenticate);
router.use(authorizeRoles('admin'));

// 1. Business Operations Overview
router.get('/overview', getOverview);

// 2. Brokerage Deals Management
router.get('/deals', getDeals);
router.post('/deals', verifyCsrfToken, createDeal);
router.get('/deals/:id', getDealById);
router.patch('/deals/:id', verifyCsrfToken, updateDeal);
router.patch('/deals/:id/commission', verifyCsrfToken, updateCommission);

// 3. Deal Commission Payments & Ledger
router.get('/deals/:id/payments', getDealPayments);
router.post('/deals/:id/payments', verifyCsrfToken, recordPayment);
router.post('/payments/:paymentId/reverse', verifyCsrfToken, reversePayment);
router.get('/commission-ledger', getCommissionLedger);

// 4. Company-Owned Property Financials & CapEx
router.get('/company-properties', getCompanyProperties);
router.get('/company-properties/:propertyId/expenses', getPropertyExpenses);
router.post('/company-properties/:propertyId/expenses', verifyCsrfToken, recordPropertyExpense);
router.post(
  '/company-properties/:propertyId/expenses/:expenseId/reverse',
  verifyCsrfToken,
  reversePropertyExpense
);

// 5. Company-Owned Property Sale Management
router.get('/company-properties/:propertyId/sale', getCompanyPropertySale);
router.post('/company-properties/:propertyId/sale', verifyCsrfToken, recordCompanyPropertySale);

// 6. General Business Expenses
router.get('/expenses', getBusinessExpenses);
router.post('/expenses', verifyCsrfToken, recordBusinessExpense);
router.post('/expenses/:id/reverse', verifyCsrfToken, reverseBusinessExpense);

// 7. Financial Reports & Analytics
router.get('/reports/summary', getReportsSummary);
router.get('/reports/export/:reportType', exportReportCsv);

export default router;

