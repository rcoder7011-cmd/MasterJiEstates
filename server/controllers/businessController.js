import { successResponse } from '../utils/apiResponse.js';
import * as businessService from '../services/businessService.js';

/**
 * 1. Business Operations Overview
 * GET /api/admin/business/overview
 */
export async function getOverview(req, res, next) {
  try {
    const data = await businessService.getBusinessOverview(req.query);
    return successResponse(res, data, 'Business operations overview retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 2. Brokerage Deals List
 * GET /api/admin/business/deals
 */
export async function getDeals(req, res, next) {
  try {
    const data = await businessService.getBrokerageDeals(req.query);
    return successResponse(res, data, 'Brokerage deals retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 3. Create Brokerage Deal
 * POST /api/admin/business/deals
 */
export async function createDeal(req, res, next) {
  try {
    const deal = await businessService.createBrokerageDeal(req.user, req.body);
    return successResponse(res, deal, 'Brokerage deal created successfully', 201);
  } catch (error) {
    return next(error);
  }
}

/**
 * 4. Get Brokerage Deal by ID
 * GET /api/admin/business/deals/:id
 */
export async function getDealById(req, res, next) {
  try {
    const deal = await businessService.getBrokerageDealById(req.params.id);
    return successResponse(res, deal, 'Brokerage deal details retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 5. Update Brokerage Deal
 * PATCH /api/admin/business/deals/:id
 */
export async function updateDeal(req, res, next) {
  try {
    const deal = await businessService.updateBrokerageDeal(req.user, req.params.id, req.body);
    return successResponse(res, deal, 'Brokerage deal updated successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 6. Update Commission Agreement Terms
 * PATCH /api/admin/business/deals/:id/commission
 */
export async function updateCommission(req, res, next) {
  try {
    const deal = await businessService.updateCommissionAgreement(req.user, req.params.id, req.body);
    return successResponse(res, deal, 'Commission agreement terms updated successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 7. Get Deal Commission Payments
 * GET /api/admin/business/deals/:id/payments
 */
export async function getDealPayments(req, res, next) {
  try {
    const payments = await businessService.getDealPayments(req.params.id);
    return successResponse(res, payments, 'Deal payments retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 8. Record Commission Payment
 * POST /api/admin/business/deals/:id/payments
 */
export async function recordPayment(req, res, next) {
  try {
    const payment = await businessService.recordCommissionPayment(req.user, req.params.id, req.body);
    return successResponse(res, payment, 'Commission payment recorded successfully', 201);
  } catch (error) {
    return next(error);
  }
}

/**
 * 9. Reverse Commission Payment
 * POST /api/admin/business/payments/:paymentId/reverse
 */
export async function reversePayment(req, res, next) {
  try {
    const payment = await businessService.reverseCommissionPayment(req.user, req.params.paymentId, req.body);
    return successResponse(res, payment, 'Commission payment reversed successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 10. Global Commission Payment Ledger
 * GET /api/admin/business/commission-ledger
 */
export async function getCommissionLedger(req, res, next) {
  try {
    const data = await businessService.getGlobalCommissionLedger(req.query);
    return successResponse(res, data, 'Commission payment ledger retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 11. Company Properties Financial Overview
 * GET /api/admin/business/company-properties
 */
export async function getCompanyProperties(req, res, next) {
  try {
    const data = await businessService.getCompanyPropertiesFinancials();
    return successResponse(res, data, 'Company properties financials retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 12. Get Property Expenses
 * GET /api/admin/business/company-properties/:propertyId/expenses
 */
export async function getPropertyExpenses(req, res, next) {
  try {
    const expenses = await businessService.getPropertyExpenses(req.params.propertyId);
    return successResponse(res, expenses, 'Property expenses retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 13. Record Property Expense
 * POST /api/admin/business/company-properties/:propertyId/expenses
 */
export async function recordPropertyExpense(req, res, next) {
  try {
    const expense = await businessService.recordPropertyExpense(
      req.user,
      req.params.propertyId,
      req.body
    );
    return successResponse(res, expense, 'Property expense recorded successfully', 201);
  } catch (error) {
    return next(error);
  }
}

/**
 * 14. Reverse Property Expense
 * POST /api/admin/business/company-properties/:propertyId/expenses/:expenseId/reverse
 */
export async function reversePropertyExpense(req, res, next) {
  try {
    const expense = await businessService.reversePropertyExpense(
      req.user,
      req.params.expenseId,
      req.body
    );
    return successResponse(res, expense, 'Property expense reversed successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 15. Get Company Property Sale Record
 * GET /api/admin/business/company-properties/:propertyId/sale
 */
export async function getCompanyPropertySale(req, res, next) {
  try {
    const sale = await businessService.getCompanyPropertySale(req.params.propertyId);
    return successResponse(res, sale, 'Company property sale details retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 16. Record Company Property Sale
 * POST /api/admin/business/company-properties/:propertyId/sale
 */
export async function recordCompanyPropertySale(req, res, next) {
  try {
    const sale = await businessService.recordCompanyPropertySale(
      req.user,
      req.params.propertyId,
      req.body
    );
    return successResponse(res, sale, 'Company property sale recorded successfully', 201);
  } catch (error) {
    return next(error);
  }
}

/**
 * 17. Get General Business Expenses
 * GET /api/admin/business/expenses
 */
export async function getBusinessExpenses(req, res, next) {
  try {
    const data = await businessService.getBusinessExpenses(req.query);
    return successResponse(res, data, 'Business expenses retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 18. Record General Business Expense
 * POST /api/admin/business/expenses
 */
export async function recordBusinessExpense(req, res, next) {
  try {
    const expense = await businessService.recordBusinessExpense(req.user, req.body);
    return successResponse(res, expense, 'Business expense recorded successfully', 201);
  } catch (error) {
    return next(error);
  }
}

/**
 * 19. Reverse General Business Expense
 * POST /api/admin/business/expenses/:id/reverse
 */
export async function reverseBusinessExpense(req, res, next) {
  try {
    const expense = await businessService.reverseBusinessExpense(req.user, req.params.id, req.body);
    return successResponse(res, expense, 'Business expense reversed successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 20. Financial Reports Summary & Analytics
 * GET /api/admin/business/reports/summary
 */
export async function getReportsSummary(req, res, next) {
  try {
    const reports = await businessService.getFinancialReports(req.query);
    return successResponse(res, reports, 'Financial reports summary retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 21. Export Financial Report as CSV (Admin Only)
 * GET /api/admin/business/reports/export/:reportType
 */
export async function exportReportCsv(req, res, next) {
  try {
    const { reportType } = req.params;
    const result = await businessService.exportFinancialReportCsv(req.user, reportType, req.query);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.status(200).send(result.csvContent);
  } catch (error) {
    return next(error);
  }
}

