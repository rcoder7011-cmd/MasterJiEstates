import mongoose from 'mongoose';
import BrokerageDeal from '../models/BrokerageDeal.js';
import CommissionPayment from '../models/CommissionPayment.js';
import PropertyExpense from '../models/PropertyExpense.js';
import CompanyPropertySale from '../models/CompanyPropertySale.js';
import BusinessExpense from '../models/BusinessExpense.js';
import Property from '../models/Property.js';
import { isDatabaseConnected } from '../config/database.js';
import { logAdminActivity } from './adminService.js';
import { inMemorySubmissionStore } from './propertySubmissionService.js';
import { demoPropertiesData } from '../data/demoPropertiesData.js';
import { formatIndianPrice } from '../utils/serializers.js';

// =================================================================
// In-Memory Fallback Stores for Offline / Demonstration Mode
// =================================================================
export const inMemoryDeals = new Map();
export const inMemoryCommissionPayments = new Map();
export const inMemoryPropertyExpenses = new Map();
export const inMemoryCompanySales = new Map();
export const inMemoryBusinessExpenses = new Map();

// Helper to seed initial sample business data for offline demo mode
function initializeDemoBusinessData() {
  if (inMemoryDeals.size > 0) return;

  const deal1 = {
    id: 'deal_demo_001',
    _id: 'deal_demo_001',
    dealReference: 'DEAL-20261101-1001',
    propertyId: 'demo-001',
    propertyTitle: 'The Grand Heritage Estate — DLF Phase 5',
    propertySlug: 'grand-heritage-estate-dlf-phase-5',
    propertyCity: 'Gurugram',
    seller: {
      userId: 'usr_seller_001',
      name: 'Rajesh Sharma',
      phone: '9811122233',
      email: 'rajesh.sharma@example.com',
    },
    buyer: {
      userId: 'usr_buyer_001',
      name: 'Priya Verma',
      phone: '9822233344',
      email: 'priya.verma@example.com',
    },
    status: 'completed',
    expectedTransactionValue: 45000000,
    actualTransactionValue: 44000000,
    currency: 'INR',
    dealDate: new Date('2026-10-15T10:00:00Z').toISOString(),
    expectedClosingDate: new Date('2026-11-01T10:00:00Z').toISOString(),
    actualClosingDate: new Date('2026-11-02T10:00:00Z').toISOString(),
    responsibleAdmin: {
      adminId: 'usr_admin_001',
      name: 'MasterJi SuperAdmin',
      email: 'admin@masterjiestates.in',
    },
    internalNotes: 'Sale deed successfully registered at Tehsil Office Gurugram.',
    commissionAgreement: {
      commissionType: 'percentage',
      percentageRate: 2,
      fixedAmount: 0,
      agreedAmount: 880000, // 2% of 4.4 Cr
      isEstimated: false,
      agreementDate: new Date('2026-10-16T12:00:00Z').toISOString(),
      payer: 'seller',
      buyerShare: 0,
      sellerShare: 880000,
      documentReference: 'MJE-BROK-2026-DLF-01',
      status: 'fully_collected',
      internalNotes: 'Brokerage terms accepted by owner in mandate agreement.',
      revisionHistory: [],
    },
    totalReceivedCommission: 880000,
    outstandingCommission: 0,
    createdAt: new Date('2026-10-15T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-11-02T10:00:00Z').toISOString(),
  };

  const deal2 = {
    id: 'deal_demo_002',
    _id: 'deal_demo_002',
    dealReference: 'DEAL-20261105-1002',
    propertyId: 'demo-002',
    propertyTitle: 'Skyline Ultra Luxury Penthouse — Golf Course Road',
    propertySlug: 'skyline-ultra-luxury-penthouse-golf-course-road',
    propertyCity: 'Gurugram',
    seller: {
      userId: 'usr_seller_002',
      name: 'Vikram Seth',
      phone: '9833344455',
      email: 'vikram.seth@example.com',
    },
    buyer: {
      userId: 'usr_buyer_002',
      name: 'Ananya Gupta',
      phone: '9844455566',
      email: 'ananya.g@example.com',
    },
    status: 'transaction_in_progress',
    expectedTransactionValue: 62000000,
    actualTransactionValue: 60000000,
    currency: 'INR',
    dealDate: new Date('2026-11-01T11:00:00Z').toISOString(),
    expectedClosingDate: new Date('2026-11-20T10:00:00Z').toISOString(),
    actualClosingDate: null,
    responsibleAdmin: {
      adminId: 'usr_admin_001',
      name: 'MasterJi SuperAdmin',
      email: 'admin@masterjiestates.in',
    },
    internalNotes: 'Buyer loan sanction letter received; token advance paid.',
    commissionAgreement: {
      commissionType: 'percentage',
      percentageRate: 1.5,
      fixedAmount: 0,
      agreedAmount: 900000, // 1.5% of 6 Cr
      isEstimated: false,
      agreementDate: new Date('2026-11-02T14:00:00Z').toISOString(),
      payer: 'both',
      buyerShare: 450000,
      sellerShare: 450000,
      documentReference: 'MJE-BROK-2026-GCR-02',
      status: 'partially_collected',
      internalNotes: 'Equal 0.75% split between buyer and seller.',
      revisionHistory: [],
    },
    totalReceivedCommission: 450000,
    outstandingCommission: 450000,
    createdAt: new Date('2026-11-01T11:00:00Z').toISOString(),
    updatedAt: new Date('2026-11-05T12:00:00Z').toISOString(),
  };

  const deal3 = {
    id: 'deal_demo_003',
    _id: 'deal_demo_003',
    dealReference: 'DEAL-20261106-1003',
    propertyId: 'demo-003',
    propertyTitle: 'Royal Palms Contemporary Villa — Nirvana Country',
    propertySlug: 'royal-palms-contemporary-villa-nirvana-country',
    propertyCity: 'Gurugram',
    seller: {
      userId: 'usr_seller_003',
      name: 'Deepak Singhal',
      phone: '9855566677',
      email: 'deepak.s@example.com',
    },
    buyer: {
      userId: null,
      name: 'Kabir Oberoi',
      phone: '9866677788',
      email: 'kabir.o@example.com',
    },
    status: 'negotiation',
    expectedTransactionValue: 38000000,
    actualTransactionValue: 0,
    currency: 'INR',
    dealDate: new Date('2026-11-06T14:00:00Z').toISOString(),
    expectedClosingDate: new Date('2026-11-30T10:00:00Z').toISOString(),
    actualClosingDate: null,
    responsibleAdmin: {
      adminId: 'usr_admin_001',
      name: 'MasterJi SuperAdmin',
      email: 'admin@masterjiestates.in',
    },
    internalNotes: 'Price counter-offer submitted by buyer; awaiting seller review.',
    commissionAgreement: {
      commissionType: 'percentage',
      percentageRate: 2,
      fixedAmount: 0,
      agreedAmount: 760000, // 2% of expected 3.8 Cr
      isEstimated: true,
      agreementDate: new Date('2026-11-06T15:00:00Z').toISOString(),
      payer: 'seller',
      buyerShare: 0,
      sellerShare: 760000,
      documentReference: 'MJE-BROK-2026-NIR-03',
      status: 'pending_agreement',
      internalNotes: 'Subject to final negotiated deed value.',
      revisionHistory: [],
    },
    totalReceivedCommission: 0,
    outstandingCommission: 760000,
    createdAt: new Date('2026-11-06T14:00:00Z').toISOString(),
    updatedAt: new Date('2026-11-06T15:00:00Z').toISOString(),
  };

  inMemoryDeals.set(deal1.id, deal1);
  inMemoryDeals.set(deal2.id, deal2);
  inMemoryDeals.set(deal3.id, deal3);

  // Seed Commission Payments
  const pay1 = {
    id: 'pay_demo_001',
    _id: 'pay_demo_001',
    paymentReference: 'PAY-20261102-3001',
    dealId: deal1.id,
    dealReference: deal1.dealReference,
    propertyTitle: deal1.propertyTitle,
    amount: 880000,
    currency: 'INR',
    paymentDate: new Date('2026-11-02T16:00:00Z').toISOString(),
    paymentMethod: 'bank_transfer',
    transactionNumber: 'HDFCR52026110200847291',
    receivedFrom: 'seller',
    payerName: 'Rajesh Sharma',
    status: 'paid',
    isReversed: false,
    reversalReason: '',
    recordedBy: {
      adminId: 'usr_admin_001',
      adminName: 'MasterJi SuperAdmin',
      adminEmail: 'admin@masterjiestates.in',
    },
    internalRemarks: 'Full commission received via RTGS upon registry completion.',
    createdAt: new Date('2026-11-02T16:00:00Z').toISOString(),
  };

  const pay2 = {
    id: 'pay_demo_002',
    _id: 'pay_demo_002',
    paymentReference: 'PAY-20261105-3002',
    dealId: deal2.id,
    dealReference: deal2.dealReference,
    propertyTitle: deal2.propertyTitle,
    amount: 450000,
    currency: 'INR',
    paymentDate: new Date('2026-11-05T11:30:00Z').toISOString(),
    paymentMethod: 'bank_transfer',
    transactionNumber: 'ICICIR2026110500192834',
    receivedFrom: 'buyer',
    payerName: 'Ananya Gupta',
    status: 'paid',
    isReversed: false,
    reversalReason: '',
    recordedBy: {
      adminId: 'usr_admin_001',
      adminName: 'MasterJi SuperAdmin',
      adminEmail: 'admin@masterjiestates.in',
    },
    internalRemarks: 'Buyer share 50% paid upon agreement to sell execution.',
    createdAt: new Date('2026-11-05T11:30:00Z').toISOString(),
  };

  inMemoryCommissionPayments.set(pay1.id, pay1);
  inMemoryCommissionPayments.set(pay2.id, pay2);

  // Seed Company Property Expenses
  const exp1 = {
    id: 'exp_demo_001',
    _id: 'exp_demo_001',
    expenseReference: 'EXP-20260210-4001',
    propertyId: 'demo-005', // Ambience Caitriona
    propertyTitle: 'Ambience Caitriona Super Luxury Apartment',
    category: 'registration',
    amount: 1250000,
    currency: 'INR',
    date: new Date('2026-02-10T10:00:00Z').toISOString(),
    vendor: 'Sub-Registrar Gurugram',
    description: 'Stamp duty and registration fees for corporate acquisition.',
    receiptReference: 'REG-GGM-2026-9281',
    paymentMethod: 'bank_transfer',
    isReversed: false,
    reversalReason: '',
    recordedBy: {
      adminId: 'usr_admin_001',
      adminName: 'MasterJi SuperAdmin',
      adminEmail: 'admin@masterjiestates.in',
    },
    createdAt: new Date('2026-02-10T10:00:00Z').toISOString(),
  };

  const exp2 = {
    id: 'exp_demo_002',
    _id: 'exp_demo_002',
    expenseReference: 'EXP-20260305-4002',
    propertyId: 'demo-005',
    propertyTitle: 'Ambience Caitriona Super Luxury Apartment',
    category: 'renovation',
    amount: 850000,
    currency: 'INR',
    date: new Date('2026-03-05T12:00:00Z').toISOString(),
    vendor: 'UrbanCraft Interiors & Civil Works',
    description: 'Italian marble polishing, terrace waterproofing, and premium repainting.',
    receiptReference: 'UC-INV-2026-441',
    paymentMethod: 'bank_transfer',
    isReversed: false,
    reversalReason: '',
    recordedBy: {
      adminId: 'usr_admin_001',
      adminName: 'MasterJi SuperAdmin',
      adminEmail: 'admin@masterjiestates.in',
    },
    createdAt: new Date('2026-03-05T12:00:00Z').toISOString(),
  };

  inMemoryPropertyExpenses.set(exp1.id, exp1);
  inMemoryPropertyExpenses.set(exp2.id, exp2);

  // Seed Company Property Sale
  const sale1 = {
    id: 'sale_demo_001',
    _id: 'sale_demo_001',
    saleReference: 'SALE-20260420-5001',
    propertyId: 'demo-005',
    propertyTitle: 'Ambience Caitriona Super Luxury Apartment',
    buyer: {
      name: 'Rohan Mehra & Associates',
      phone: '9811199988',
      email: 'rohan.mehra@example.com',
      address: 'Penthouse 14, Tower C, DLF Phase 5, Gurugram',
    },
    saleDate: new Date('2026-04-20T10:00:00Z').toISOString(),
    saleAmount: 32000000, // 3.20 Cr
    currency: 'INR',
    agreementReference: 'MJE-SALE-DIR-2026-05',
    paymentReceived: 32000000,
    outstandingBalance: 0,
    paymentStatus: 'fully_paid',
    acquisitionCost: 26000000, // 2.60 Cr purchase
    totalExpenses: 2100000, // 12.5L reg + 8.5L reno = 21L
    totalInvestment: 28100000, // 2.81 Cr
    grossProfit: 3900000, // 39 Lakhs Gross Profit
    grossMarginPercentage: 12.19, // 12.19%
    internalRemarks: 'Clear title resale completed. Buyer transferred funds via RTGS.',
    recordedBy: {
      adminId: 'usr_admin_001',
      adminName: 'MasterJi SuperAdmin',
      adminEmail: 'admin@masterjiestates.in',
    },
    createdAt: new Date('2026-04-20T10:00:00Z').toISOString(),
  };

  inMemoryCompanySales.set(sale1.id, sale1);

  // Seed General Business Expenses
  const bExp1 = {
    id: 'bexp_demo_001',
    _id: 'bexp_demo_001',
    expenseReference: 'BEXP-20261001-6001',
    title: 'Headquarters Office Lease — Sector 44 Gurugram',
    category: 'office_rent',
    amount: 180000,
    currency: 'INR',
    date: new Date('2026-10-01T09:00:00Z').toISOString(),
    vendor: 'CyberHub Commercial Properties Ltd',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'NEFT-OCT-2026-OFFICE-01',
    description: 'Monthly office rental for operations and client greeting lounge.',
    receiptReference: 'CH-RCPT-2026-1001',
    isReversed: false,
    reversalReason: '',
    recordedBy: {
      adminId: 'usr_admin_001',
      adminName: 'MasterJi SuperAdmin',
      adminEmail: 'admin@masterjiestates.in',
    },
    createdAt: new Date('2026-10-01T09:00:00Z').toISOString(),
  };

  const bExp2 = {
    id: 'bexp_demo_002',
    _id: 'bexp_demo_002',
    expenseReference: 'BEXP-20261015-6002',
    title: 'Google Cloud Platform & AWS Cloud Infrastructure',
    category: 'software_subscriptions',
    amount: 32000,
    currency: 'INR',
    date: new Date('2026-10-15T10:00:00Z').toISOString(),
    vendor: 'Google Cloud India / Amazon Web Services',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'CC-AUTO-GCP-OCT-2026',
    description: 'Cloud hosting, database backups, and CDN media delivery.',
    receiptReference: 'GCP-IN-2026-8841',
    isReversed: false,
    reversalReason: '',
    recordedBy: {
      adminId: 'usr_admin_001',
      adminName: 'MasterJi SuperAdmin',
      adminEmail: 'admin@masterjiestates.in',
    },
    createdAt: new Date('2026-10-15T10:00:00Z').toISOString(),
  };

  const bExp3 = {
    id: 'bexp_demo_003',
    _id: 'bexp_demo_003',
    expenseReference: 'BEXP-20261101-6003',
    title: 'Digital Property Marketing & Local Print Campaign',
    category: 'marketing',
    amount: 95000,
    currency: 'INR',
    date: new Date('2026-11-01T10:00:00Z').toISOString(),
    vendor: 'Horizon Media & AdWorks LLP',
    paymentMethod: 'upi',
    referenceNumber: 'UPI-HORIZON-9921029',
    description: 'Social media targeting for luxury properties in Golf Course Ext Rd.',
    receiptReference: 'HM-INV-2026-1101',
    isReversed: false,
    reversalReason: '',
    recordedBy: {
      adminId: 'usr_admin_001',
      adminName: 'MasterJi SuperAdmin',
      adminEmail: 'admin@masterjiestates.in',
    },
    createdAt: new Date('2026-11-01T10:00:00Z').toISOString(),
  };

  inMemoryBusinessExpenses.set(bExp1.id, bExp1);
  inMemoryBusinessExpenses.set(bExp2.id, bExp2);
  inMemoryBusinessExpenses.set(bExp3.id, bExp3);
}

// Auto-initialize demo data on load
initializeDemoBusinessData();

// =================================================================
// Reference ID Generators
// =================================================================
function generateReference(prefix) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
}

// =================================================================
// Date Range Filtering Helper
// =================================================================
export function resolveDateFilter(range, startDate, endDate) {
  const now = new Date();

  if (range === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (range === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (range === 'last_3_months') {
    const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const end = now;
    return { start, end };
  }

  if (range === 'this_year') {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { start, end };
  }

  if (range === 'custom' && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      return { start, end };
    }
  }

  return null; // All time
}

// =================================================================
// Commission Calculation Helper
// =================================================================
export function calculateCommission({
  actualTransactionValue = 0,
  expectedTransactionValue = 0,
  commissionType = 'percentage',
  percentageRate = 2,
  fixedAmount = 0,
  payer = 'seller',
  buyerShare = 0,
  sellerShare = 0,
}) {
  const actualVal = Math.max(0, Math.round(Number(actualTransactionValue) || 0));
  const expectedVal = Math.max(0, Math.round(Number(expectedTransactionValue) || 0));
  const rate = Math.max(0, Math.min(100, Number(percentageRate) || 0));
  const fixed = Math.max(0, Math.round(Number(fixedAmount) || 0));

  let agreedAmount = 0;
  let isEstimated = false;

  if (commissionType === 'percentage') {
    if (actualVal > 0) {
      agreedAmount = Math.round((actualVal * rate) / 100);
      isEstimated = false;
    } else {
      agreedAmount = Math.round((expectedVal * rate) / 100);
      isEstimated = true;
    }
  } else {
    agreedAmount = fixed;
    isEstimated = false;
  }

  // Handle payer partition
  let calcBuyerShare = 0;
  let calcSellerShare = agreedAmount;

  if (payer === 'buyer') {
    calcBuyerShare = agreedAmount;
    calcSellerShare = 0;
  } else if (payer === 'both') {
    if (buyerShare > 0 || sellerShare > 0) {
      calcBuyerShare = Math.round(Number(buyerShare) || 0);
      calcSellerShare = Math.round(Number(sellerShare) || 0);
    } else {
      // Default to 50/50 split
      calcBuyerShare = Math.round(agreedAmount / 2);
      calcSellerShare = agreedAmount - calcBuyerShare;
    }
  }

  return {
    agreedAmount,
    isEstimated,
    buyerShare: calcBuyerShare,
    sellerShare: calcSellerShare,
  };
}

// =================================================================
// 1. Business Operations Overview
// =================================================================
export async function getBusinessOverview({ range = 'all', startDate = '', endDate = '' } = {}) {
  const dateFilter = resolveDateFilter(range, startDate, endDate);
  const dbConnected = isDatabaseConnected();

  if (dbConnected) {
    try {
      const matchDate = (field) => {
        if (!dateFilter) return {};
        return { [field]: { $gte: dateFilter.start, $lte: dateFilter.end } };
      };

      const [deals, payments, companySales, companyExpenses, businessExpenses, unsoldCompanyProps] =
        await Promise.all([
          BrokerageDeal.find(matchDate('dealDate')).lean(),
          CommissionPayment.find({ isReversed: false, ...matchDate('paymentDate') }).lean(),
          CompanyPropertySale.find(matchDate('saleDate')).lean(),
          PropertyExpense.find({ isReversed: false, ...matchDate('date') }).lean(),
          BusinessExpense.find({ isReversed: false, ...matchDate('date') }).lean(),
          Property.find({
            listingType: 'company_owned',
            availabilityStatus: { $in: ['available', 'under_negotiation'] },
          })
            .select('+acquisitionCost')
            .lean(),
        ]);

      return aggregateOverviewData({
        deals,
        payments,
        companySales,
        companyExpenses,
        businessExpenses,
        unsoldCompanyProps,
        dateFilter,
        range,
        dbConnected: true,
      });
    } catch (err) {
      console.error('[BusinessService] Error querying MongoDB overview, falling back to memory:', err.message);
    }
  }

  // In-Memory Fallback Overview
  const filterByDate = (items, dateField) => {
    if (!dateFilter) return items;
    return items.filter((item) => {
      const t = new Date(item[dateField] || 0).getTime();
      return t >= dateFilter.start.getTime() && t <= dateFilter.end.getTime();
    });
  };

  const deals = filterByDate(Array.from(inMemoryDeals.values()), 'dealDate');
  const payments = filterByDate(
    Array.from(inMemoryCommissionPayments.values()).filter((p) => !p.isReversed),
    'paymentDate'
  );
  const companySales = filterByDate(Array.from(inMemoryCompanySales.values()), 'saleDate');
  const companyExpenses = filterByDate(
    Array.from(inMemoryPropertyExpenses.values()).filter((e) => !e.isReversed),
    'date'
  );
  const businessExpenses = filterByDate(
    Array.from(inMemoryBusinessExpenses.values()).filter((e) => !e.isReversed),
    'date'
  );

  // Unsold company properties from submission store and demo data
  const allProps = [
    ...Array.from(inMemorySubmissionStore.values()),
    ...demoPropertiesData,
  ];
  const unsoldCompanyProps = allProps.filter(
    (p) =>
      p.listingType === 'company_owned' &&
      ['available', 'under_negotiation'].includes(p.availabilityStatus)
  );

  return aggregateOverviewData({
    deals,
    payments,
    companySales,
    companyExpenses,
    businessExpenses,
    unsoldCompanyProps,
    dateFilter,
    range,
    dbConnected: false,
  });
}

function aggregateOverviewData({
  deals,
  payments,
  companySales,
  companyExpenses,
  businessExpenses,
  unsoldCompanyProps,
  dateFilter,
  range,
  dbConnected,
}) {
  // Brokerage Metrics
  const activeDeals = deals.filter((d) =>
    ['lead', 'negotiation', 'agreement_pending', 'agreement_signed', 'transaction_in_progress'].includes(d.status)
  );
  const completedDeals = deals.filter((d) => d.status === 'completed');

  const totalCommissionAgreed = deals.reduce(
    (acc, d) => acc + (d.commissionAgreement?.agreedAmount || 0),
    0
  );

  const totalCommissionReceived = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const outstandingCommission = Math.max(0, totalCommissionAgreed - totalCommissionReceived);

  // Company Inventory Metrics
  const totalCompanyAcquisitionCost = companySales.reduce((acc, s) => acc + (s.acquisitionCost || 0), 0);
  const totalCompanyExpenses = companyExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalCompanySalesRevenue = companySales.reduce((acc, s) => acc + (s.saleAmount || 0), 0);
  const grossProfitCompanySales = companySales.reduce((acc, s) => acc + (s.grossProfit || 0), 0);

  // Unsold inventory investment
  const unsoldAcquisitionCost = unsoldCompanyProps.reduce(
    (acc, p) => acc + (p.acquisitionCost || 0),
    0
  );

  // General Business Expenses
  const totalGeneralExpenses = businessExpenses.reduce((acc, b) => acc + (b.amount || 0), 0);

  // Pending Payments count
  const pendingPaymentsCount = deals.filter((d) => (d.outstandingCommission || 0) > 0).length;

  // Build Recent Transactions Feed (sorted newest first)
  const recentTransactions = [];

  payments.forEach((p) => {
    recentTransactions.push({
      id: p.id || p._id,
      type: 'commission_payment',
      title: `Commission Received — ${p.propertyTitle || p.dealReference}`,
      reference: p.paymentReference,
      amount: p.amount,
      date: p.paymentDate,
      method: p.paymentMethod,
      payer: p.receivedFrom,
      status: p.status,
    });
  });

  companySales.forEach((s) => {
    recentTransactions.push({
      id: s.id || s._id,
      type: 'company_sale',
      title: `Company Property Sale — ${s.propertyTitle}`,
      reference: s.saleReference,
      amount: s.saleAmount,
      date: s.saleDate,
      method: 'bank_transfer',
      payer: s.buyer?.name || 'Buyer',
      status: s.paymentStatus,
    });
  });

  companyExpenses.forEach((e) => {
    recentTransactions.push({
      id: e.id || e._id,
      type: 'property_expense',
      title: `Property Expense — ${e.propertyTitle} (${e.category})`,
      reference: e.expenseReference,
      amount: -e.amount,
      date: e.date,
      method: e.paymentMethod,
      payer: e.vendor || 'Vendor',
      status: 'paid',
    });
  });

  businessExpenses.forEach((b) => {
    recentTransactions.push({
      id: b.id || b._id,
      type: 'business_expense',
      title: `Operating Expense — ${b.title}`,
      reference: b.expenseReference,
      amount: -b.amount,
      date: b.date,
      method: b.paymentMethod,
      payer: b.vendor || 'Vendor',
      status: 'paid',
    });
  });

  recentTransactions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return {
    databaseStatus: {
      connected: dbConnected,
      message: dbConnected
        ? 'MongoDB Atlas Connected'
        : 'Running in Local Synchronized In-Memory Mode (Demo Credentials)',
    },
    filter: {
      range,
      startDate: dateFilter ? dateFilter.start.toISOString() : null,
      endDate: dateFilter ? dateFilter.end.toISOString() : null,
    },
    metrics: {
      totalActiveDeals: activeDeals.length,
      completedDealsCount: completedDeals.length,
      totalCommissionAgreed,
      totalCommissionAgreedFormatted: formatIndianPrice(totalCommissionAgreed),
      totalCommissionReceived,
      totalCommissionReceivedFormatted: formatIndianPrice(totalCommissionReceived),
      outstandingCommission,
      outstandingCommissionFormatted: formatIndianPrice(outstandingCommission),
      totalCompanyAcquisitionCost,
      totalCompanyAcquisitionCostFormatted: formatIndianPrice(totalCompanyAcquisitionCost),
      totalCompanyExpenses,
      totalCompanyExpensesFormatted: formatIndianPrice(totalCompanyExpenses),
      totalCompanySalesRevenue,
      totalCompanySalesRevenueFormatted: formatIndianPrice(totalCompanySalesRevenue),
      grossProfitCompanySales,
      grossProfitCompanySalesFormatted: formatIndianPrice(grossProfitCompanySales),
      unsoldAcquisitionCost,
      unsoldAcquisitionCostFormatted: formatIndianPrice(unsoldAcquisitionCost),
      totalGeneralExpenses,
      totalGeneralExpensesFormatted: formatIndianPrice(totalGeneralExpenses),
      pendingPaymentsCount,
    },
    recentTransactions: recentTransactions.slice(0, 15),
  };
}

// =================================================================
// 2. Brokerage Deal Management
// =================================================================
export async function getBrokerageDeals({
  page = 1,
  limit = 10,
  status = '',
  search = '',
  range = 'all',
  startDate = '',
  endDate = '',
  sortBy = 'newest',
} = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;
  const dateFilter = resolveDateFilter(range, startDate, endDate);

  if (isDatabaseConnected()) {
    try {
      const query = {};
      if (status) query.status = status;
      if (dateFilter) {
        query.dealDate = { $gte: dateFilter.start, $lte: dateFilter.end };
      }
      if (search && search.trim()) {
        const s = search.trim();
        query.$or = [
          { dealReference: new RegExp(s, 'i') },
          { propertyTitle: new RegExp(s, 'i') },
          { 'seller.name': new RegExp(s, 'i') },
          { 'buyer.name': new RegExp(s, 'i') },
        ];
      }

      const sortOrder = sortBy === 'oldest' ? { dealDate: 1 } : { dealDate: -1 };

      const [total, docs] = await Promise.all([
        BrokerageDeal.countDocuments(query),
        BrokerageDeal.find(query).sort(sortOrder).skip(skip).limit(l).lean(),
      ]);

      return {
        items: docs.map(formatDealOutput),
        pagination: {
          page: p,
          limit: l,
          total,
          totalPages: Math.ceil(total / l) || 1,
        },
      };
    } catch (err) {
      console.error('[BusinessService] Error querying MongoDB deals:', err.message);
    }
  }

  // In-Memory Fallback
  let all = Array.from(inMemoryDeals.values());

  if (status) all = all.filter((d) => d.status === status);
  if (dateFilter) {
    all = all.filter((d) => {
      const t = new Date(d.dealDate || 0).getTime();
      return t >= dateFilter.start.getTime() && t <= dateFilter.end.getTime();
    });
  }
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    all = all.filter(
      (d) =>
        d.dealReference?.toLowerCase().includes(s) ||
        d.propertyTitle?.toLowerCase().includes(s) ||
        d.seller?.name?.toLowerCase().includes(s) ||
        d.buyer?.name?.toLowerCase().includes(s)
    );
  }

  all.sort((a, b) => {
    const timeA = new Date(a.dealDate || 0).getTime();
    const timeB = new Date(b.dealDate || 0).getTime();
    return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
  });

  const total = all.length;
  const paginated = all.slice(skip, skip + l);

  return {
    items: paginated.map(formatDealOutput),
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

export async function createBrokerageDeal(adminUser, dealData) {
  const {
    propertyId,
    seller,
    buyer,
    enquiryId,
    status = 'lead',
    expectedTransactionValue = 0,
    actualTransactionValue = 0,
    dealDate = new Date(),
    expectedClosingDate,
    internalNotes = '',
    commissionTerms = {},
  } = dealData;

  // Resolve property title
  let propertyTitle = dealData.propertyTitle || '';
  let propertySlug = dealData.propertySlug || '';
  let propertyCity = dealData.propertyCity || '';

  if (propertyId) {
    if (isDatabaseConnected()) {
      try {
        const prop = await Property.findById(propertyId).lean();
        if (prop) {
          propertyTitle = prop.title;
          propertySlug = prop.slug;
          propertyCity = prop.city;
        }
      } catch (err) {
        // proceed
      }
    }
    if (!propertyTitle) {
      const demoProp = demoPropertiesData.find(
        (p) => p.id === propertyId || p.demoId === propertyId || p._id === propertyId
      );
      if (demoProp) {
        propertyTitle = demoProp.title;
        propertySlug = demoProp.slug;
        propertyCity = demoProp.city;
      }
    }
  }

  if (!propertyTitle) {
    propertyTitle = 'Brokerage Real Estate Deal';
  }

  const dealReference = generateReference('DEAL');

  // Compute Commission
  const commCalc = calculateCommission({
    actualTransactionValue,
    expectedTransactionValue,
    commissionType: commissionTerms.commissionType || 'percentage',
    percentageRate: commissionTerms.percentageRate !== undefined ? commissionTerms.percentageRate : 2,
    fixedAmount: commissionTerms.fixedAmount || 0,
    payer: commissionTerms.payer || 'seller',
    buyerShare: commissionTerms.buyerShare || 0,
    sellerShare: commissionTerms.sellerShare || 0,
  });

  const commissionAgreement = {
    commissionType: commissionTerms.commissionType || 'percentage',
    percentageRate: Number(commissionTerms.percentageRate !== undefined ? commissionTerms.percentageRate : 2),
    fixedAmount: Number(commissionTerms.fixedAmount || 0),
    agreedAmount: commCalc.agreedAmount,
    isEstimated: commCalc.isEstimated,
    agreementDate: commissionTerms.agreementDate ? new Date(commissionTerms.agreementDate) : new Date(),
    payer: commissionTerms.payer || 'seller',
    buyerShare: commCalc.buyerShare,
    sellerShare: commCalc.sellerShare,
    documentReference: (commissionTerms.documentReference || '').trim(),
    status: commissionTerms.status || 'pending_agreement',
    internalNotes: (commissionTerms.internalNotes || '').trim(),
    revisionHistory: [],
  };

  const newDeal = {
    dealReference,
    propertyId: propertyId || null,
    propertyTitle,
    propertySlug,
    propertyCity,
    seller: {
      userId: seller?.userId || null,
      name: (seller?.name || '').trim(),
      phone: (seller?.phone || '').trim(),
      email: (seller?.email || '').trim().toLowerCase(),
    },
    buyer: {
      userId: buyer?.userId || null,
      name: (buyer?.name || '').trim(),
      phone: (buyer?.phone || '').trim(),
      email: (buyer?.email || '').trim().toLowerCase(),
    },
    enquiryId: enquiryId || null,
    status,
    expectedTransactionValue: Number(expectedTransactionValue) || 0,
    actualTransactionValue: Number(actualTransactionValue) || 0,
    currency: 'INR',
    dealDate: new Date(dealDate),
    expectedClosingDate: expectedClosingDate ? new Date(expectedClosingDate) : null,
    actualClosingDate: null,
    responsibleAdmin: {
      adminId: adminUser.id,
      name: adminUser.fullName || 'Admin',
      email: adminUser.email || '',
    },
    internalNotes: (internalNotes || '').trim(),
    commissionAgreement,
    totalReceivedCommission: 0,
    outstandingCommission: commCalc.agreedAmount,
  };

  let savedDeal;

  if (isDatabaseConnected()) {
    try {
      const doc = await BrokerageDeal.create(newDeal);
      savedDeal = formatDealOutput(doc.toObject());
    } catch (err) {
      console.error('[BusinessService] Error creating MongoDB deal:', err.message);
    }
  }

  if (!savedDeal) {
    const memoryId = `deal_${Date.now()}`;
    savedDeal = {
      id: memoryId,
      _id: memoryId,
      ...newDeal,
      dealDate: newDeal.dealDate.toISOString(),
      expectedClosingDate: newDeal.expectedClosingDate ? newDeal.expectedClosingDate.toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryDeals.set(memoryId, savedDeal);
  }

  // Audit Log
  await logAdminActivity(adminUser, {
    action: 'deal_created',
    targetType: 'deal',
    targetId: savedDeal.id || savedDeal._id,
    targetTitle: savedDeal.dealReference,
    metadata: {
      propertyTitle,
      expectedTransactionValue,
      agreedCommission: commCalc.agreedAmount,
    },
  });

  return savedDeal;
}

export async function getBrokerageDealById(dealId) {
  let deal = null;

  if (isDatabaseConnected()) {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(dealId);
      const filter = isObjectId ? { _id: dealId } : { dealReference: dealId };
      deal = await BrokerageDeal.findOne(filter).lean();
    } catch (err) {
      // fallback
    }
  }

  if (!deal) {
    deal = inMemoryDeals.get(dealId);
    if (!deal) {
      for (const item of inMemoryDeals.values()) {
        if (item.dealReference === dealId || item._id === dealId) {
          deal = item;
          break;
        }
      }
    }
  }

  if (!deal) {
    const error = new Error('Brokerage deal record not found.');
    error.statusCode = 404;
    throw error;
  }

  // Also fetch payments for this deal
  const payments = await getDealPayments(deal.id || deal._id);

  return {
    ...formatDealOutput(deal),
    payments,
  };
}

export async function updateBrokerageDeal(adminUser, dealId, updateData) {
  const VALID_STATUSES = [
    'lead',
    'negotiation',
    'agreement_pending',
    'agreement_signed',
    'transaction_in_progress',
    'completed',
    'cancelled',
    'on_hold',
  ];

  let deal = null;
  let dealDoc = null;

  if (isDatabaseConnected()) {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(dealId);
      const filter = isObjectId ? { _id: dealId } : { dealReference: dealId };
      dealDoc = await BrokerageDeal.findOne(filter);
      if (dealDoc) {
        deal = dealDoc.toObject();
      }
    } catch (err) {
      // fallback
    }
  }

  if (!deal) {
    deal = inMemoryDeals.get(dealId);
    if (!deal) {
      for (const item of inMemoryDeals.values()) {
        if (item.dealReference === dealId || item._id === dealId) {
          deal = item;
          break;
        }
      }
    }
  }

  if (!deal) {
    const error = new Error('Brokerage deal record not found.');
    error.statusCode = 404;
    throw error;
  }

  const previousStatus = deal.status;

  if (updateData.status) {
    if (!VALID_STATUSES.includes(updateData.status)) {
      const error = new Error(`Invalid deal status. Must be one of [${VALID_STATUSES.join(', ')}]`);
      error.statusCode = 400;
      throw error;
    }
    deal.status = updateData.status;
    if (updateData.status === 'completed' && !deal.actualClosingDate) {
      deal.actualClosingDate = new Date();
    }
  }

  if (updateData.expectedTransactionValue !== undefined) {
    deal.expectedTransactionValue = Number(updateData.expectedTransactionValue) || 0;
  }

  if (updateData.actualTransactionValue !== undefined) {
    deal.actualTransactionValue = Number(updateData.actualTransactionValue) || 0;
    // Recompute commission if percentage
    if (deal.commissionAgreement?.commissionType === 'percentage') {
      const reCalc = calculateCommission({
        actualTransactionValue: deal.actualTransactionValue,
        expectedTransactionValue: deal.expectedTransactionValue,
        commissionType: 'percentage',
        percentageRate: deal.commissionAgreement.percentageRate,
        payer: deal.commissionAgreement.payer,
      });
      deal.commissionAgreement.agreedAmount = reCalc.agreedAmount;
      deal.commissionAgreement.isEstimated = reCalc.isEstimated;
      deal.commissionAgreement.buyerShare = reCalc.buyerShare;
      deal.commissionAgreement.sellerShare = reCalc.sellerShare;
      deal.outstandingCommission = Math.max(0, reCalc.agreedAmount - (deal.totalReceivedCommission || 0));
    }
  }

  if (updateData.seller) {
    deal.seller = { ...deal.seller, ...updateData.seller };
  }
  if (updateData.buyer) {
    deal.buyer = { ...deal.buyer, ...updateData.buyer };
  }
  if (updateData.internalNotes !== undefined) {
    deal.internalNotes = updateData.internalNotes.trim();
  }
  if (updateData.expectedClosingDate) {
    deal.expectedClosingDate = new Date(updateData.expectedClosingDate);
  }

  deal.updatedAt = new Date();

  if (dealDoc) {
    Object.assign(dealDoc, deal);
    await dealDoc.save();
  } else {
    inMemoryDeals.set(deal.id || deal._id, deal);
  }

  // Audit
  await logAdminActivity(adminUser, {
    action: updateData.status && updateData.status !== previousStatus ? 'deal_status_updated' : 'deal_updated',
    targetType: 'deal',
    targetId: deal.id || deal._id,
    targetTitle: deal.dealReference,
    reason: `Status transition from "${previousStatus}" to "${deal.status}"`,
    metadata: {
      status: deal.status,
      actualTransactionValue: deal.actualTransactionValue,
    },
  });

  return formatDealOutput(deal);
}

export async function updateCommissionAgreement(adminUser, dealId, commissionData) {
  const {
    commissionType,
    percentageRate,
    fixedAmount,
    payer,
    buyerShare,
    sellerShare,
    documentReference,
    status,
    internalNotes,
    revisionReason,
  } = commissionData;

  const cleanReason = (revisionReason || '').trim();
  if (!cleanReason || cleanReason.length < 5) {
    const error = new Error('A detailed revision reason (at least 5 characters) is required to revise commission terms.');
    error.statusCode = 400;
    throw error;
  }

  const dealDetail = await getBrokerageDealById(dealId);
  const deal = dealDetail;

  // Preserve non-circular previous terms snapshot
  const previousTerms = {
    commissionType: deal.commissionAgreement?.commissionType,
    percentageRate: deal.commissionAgreement?.percentageRate,
    fixedAmount: deal.commissionAgreement?.fixedAmount,
    agreedAmount: deal.commissionAgreement?.agreedAmount,
    payer: deal.commissionAgreement?.payer,
    buyerShare: deal.commissionAgreement?.buyerShare,
    sellerShare: deal.commissionAgreement?.sellerShare,
    documentReference: deal.commissionAgreement?.documentReference,
    status: deal.commissionAgreement?.status,
    internalNotes: deal.commissionAgreement?.internalNotes,
  };

  const newType = commissionType || deal.commissionAgreement?.commissionType || 'percentage';
  const newRate = percentageRate !== undefined ? Number(percentageRate) : deal.commissionAgreement?.percentageRate;
  const newFixed = fixedAmount !== undefined ? Number(fixedAmount) : deal.commissionAgreement?.fixedAmount;
  const newPayer = payer || deal.commissionAgreement?.payer || 'seller';

  const calc = calculateCommission({
    actualTransactionValue: deal.actualTransactionValue,
    expectedTransactionValue: deal.expectedTransactionValue,
    commissionType: newType,
    percentageRate: newRate,
    fixedAmount: newFixed,
    payer: newPayer,
    buyerShare,
    sellerShare,
  });

  const existingHistory = Array.isArray(deal.commissionAgreement?.revisionHistory)
    ? deal.commissionAgreement.revisionHistory.map((item) => ({ ...item }))
    : [];

  const revision = {
    revisedAt: new Date().toISOString(),
    revisedBy: {
      adminId: adminUser.id,
      adminName: adminUser.fullName || 'Admin',
    },
    previousTerms,
    reason: cleanReason,
  };

  const updatedAgreement = {
    ...deal.commissionAgreement,
    commissionType: newType,
    percentageRate: newRate,
    fixedAmount: newFixed,
    agreedAmount: calc.agreedAmount,
    isEstimated: calc.isEstimated,
    payer: newPayer,
    buyerShare: calc.buyerShare,
    sellerShare: calc.sellerShare,
    documentReference: documentReference !== undefined ? documentReference.trim() : deal.commissionAgreement?.documentReference,
    status: status || deal.commissionAgreement?.status,
    internalNotes: internalNotes !== undefined ? internalNotes.trim() : deal.commissionAgreement?.internalNotes,
    revisionHistory: [revision, ...existingHistory],
  };

  const newOutstanding = Math.max(0, calc.agreedAmount - (deal.totalReceivedCommission || 0));

  if (isDatabaseConnected()) {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(dealId);
      const filter = isObjectId ? { _id: dealId } : { dealReference: dealId };
      await BrokerageDeal.updateOne(filter, {
        $set: {
          commissionAgreement: updatedAgreement,
          outstandingCommission: newOutstanding,
        },
      });
    } catch (err) {
      // proceed
    }
  }

  // Update memory store
  let memoryRecord = inMemoryDeals.get(deal.id) || inMemoryDeals.get(deal._id) || inMemoryDeals.get(deal.dealReference);
  if (!memoryRecord) {
    for (const item of inMemoryDeals.values()) {
      if (item.id === deal.id || item._id === deal._id || item.dealReference === deal.dealReference) {
        memoryRecord = item;
        break;
      }
    }
  }
  if (memoryRecord) {
    memoryRecord.commissionAgreement = updatedAgreement;
    memoryRecord.outstandingCommission = newOutstanding;
    inMemoryDeals.set(memoryRecord.id || memoryRecord._id, memoryRecord);
  }

  // Audit
  await logAdminActivity(adminUser, {
    action: 'commission_agreement_updated',
    targetType: 'deal',
    targetId: deal.id || deal._id,
    targetTitle: deal.dealReference,
    reason: cleanReason,
    metadata: {
      agreedAmount: calc.agreedAmount,
      commissionType: newType,
    },
  });

  return getBrokerageDealById(dealId);
}

// =================================================================
// 3. Commission Payment Ledger
// =================================================================
export async function getDealPayments(dealId) {
  if (isDatabaseConnected()) {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(dealId);
      const filter = isObjectId ? { dealId } : { dealReference: dealId };
      const payments = await CommissionPayment.find(filter).sort({ paymentDate: -1 }).lean();
      return payments.map(formatPaymentOutput);
    } catch (err) {
      // proceed
    }
  }

  const list = Array.from(inMemoryCommissionPayments.values()).filter(
    (p) => p.dealId === dealId || p.dealReference === dealId
  );
  list.sort((a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0));
  return list.map(formatPaymentOutput);
}

export async function recordCommissionPayment(adminUser, dealId, paymentData) {
  const {
    amount,
    paymentDate = new Date(),
    paymentMethod,
    transactionNumber = '',
    receivedFrom = 'seller',
    payerName = '',
    internalRemarks = '',
  } = paymentData;

  const cleanAmount = Math.round(Number(amount));
  if (isNaN(cleanAmount) || cleanAmount <= 0) {
    const error = new Error('Payment amount must be a valid positive number.');
    error.statusCode = 400;
    throw error;
  }

  const VALID_METHODS = ['bank_transfer', 'upi', 'cheque', 'cash', 'other'];
  if (!VALID_METHODS.includes(paymentMethod)) {
    const error = new Error(`Invalid payment method. Allowed: ${VALID_METHODS.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const deal = await getBrokerageDealById(dealId);

  // Prevent duplicate transaction numbers if provided
  if (transactionNumber && transactionNumber.trim()) {
    const cleanTx = transactionNumber.trim();
    if (isDatabaseConnected()) {
      const existing = await CommissionPayment.findOne({ transactionNumber: cleanTx }).lean();
      if (existing) {
        const error = new Error(`Transaction reference "${cleanTx}" has already been recorded.`);
        error.statusCode = 400;
        throw error;
      }
    } else {
      const existing = Array.from(inMemoryCommissionPayments.values()).find(
        (p) => p.transactionNumber?.toLowerCase() === cleanTx.toLowerCase()
      );
      if (existing) {
        const error = new Error(`Transaction reference "${cleanTx}" has already been recorded.`);
        error.statusCode = 400;
        throw error;
      }
    }
  }

  // Overpayment verification
  const currentOutstanding = deal.outstandingCommission || 0;
  if (cleanAmount > currentOutstanding) {
    const error = new Error(
      `Payment amount (₹${cleanAmount}) exceeds outstanding commission balance of ₹${currentOutstanding}.`
    );
    error.statusCode = 400;
    throw error;
  }

  const paymentReference = generateReference('PAY');

  const newPayment = {
    paymentReference,
    dealId: deal.id || deal._id,
    dealReference: deal.dealReference,
    propertyTitle: deal.propertyTitle,
    amount: cleanAmount,
    currency: 'INR',
    paymentDate: new Date(paymentDate),
    paymentMethod,
    transactionNumber: (transactionNumber || '').trim(),
    receivedFrom,
    payerName: (payerName || '').trim() || (receivedFrom === 'seller' ? deal.seller?.name : deal.buyer?.name),
    status: 'paid',
    isReversed: false,
    recordedBy: {
      adminId: adminUser.id,
      adminName: adminUser.fullName || 'Admin',
      adminEmail: adminUser.email || '',
    },
    internalRemarks: (internalRemarks || '').trim(),
  };

  let savedPayment;

  if (isDatabaseConnected()) {
    try {
      const doc = await CommissionPayment.create(newPayment);
      savedPayment = formatPaymentOutput(doc.toObject());

      // Update deal totals
      const newReceived = (deal.totalReceivedCommission || 0) + cleanAmount;
      const newOutstanding = Math.max(0, deal.commissionAgreement.agreedAmount - newReceived);
      const newStatus =
        newOutstanding === 0
          ? 'fully_collected'
          : newReceived > 0
          ? 'partially_collected'
          : deal.commissionAgreement.status;

      await BrokerageDeal.findByIdAndUpdate(deal.id || deal._id, {
        $set: {
          totalReceivedCommission: newReceived,
          outstandingCommission: newOutstanding,
          'commissionAgreement.status': newStatus,
        },
      });
    } catch (err) {
      console.error('[BusinessService] Error recording MongoDB commission payment:', err.message);
    }
  }

  if (!savedPayment) {
    const memoryId = `pay_${Date.now()}`;
    savedPayment = {
      id: memoryId,
      _id: memoryId,
      ...newPayment,
      paymentDate: newPayment.paymentDate.toISOString(),
      createdAt: new Date().toISOString(),
    };
    inMemoryCommissionPayments.set(memoryId, savedPayment);

    // Update in-memory deal
    let memDeal = inMemoryDeals.get(deal.id) || inMemoryDeals.get(deal._id) || inMemoryDeals.get(deal.dealReference);
    if (!memDeal) {
      for (const item of inMemoryDeals.values()) {
        if (item.id === deal.id || item._id === deal._id || item.dealReference === deal.dealReference) {
          memDeal = item;
          break;
        }
      }
    }
    if (memDeal) {
      memDeal.totalReceivedCommission = (memDeal.totalReceivedCommission || 0) + cleanAmount;
      memDeal.outstandingCommission = Math.max(0, memDeal.commissionAgreement.agreedAmount - memDeal.totalReceivedCommission);
      if (memDeal.outstandingCommission === 0) {
        memDeal.commissionAgreement.status = 'fully_collected';
      } else if (memDeal.totalReceivedCommission > 0) {
        memDeal.commissionAgreement.status = 'partially_collected';
      }
      inMemoryDeals.set(memDeal.id || memDeal._id, memDeal);
    }
  }

  // Audit
  await logAdminActivity(adminUser, {
    action: 'commission_payment_recorded',
    targetType: 'commission_payment',
    targetId: savedPayment.id || savedPayment._id,
    targetTitle: savedPayment.paymentReference,
    metadata: {
      dealReference: deal.dealReference,
      amount: cleanAmount,
      paymentMethod,
    },
  });

  return savedPayment;
}

export async function reverseCommissionPayment(adminUser, paymentId, { reason = '' } = {}) {
  const cleanReason = (reason || '').trim();
  if (!cleanReason || cleanReason.length < 5) {
    const error = new Error('A detailed reversal reason (at least 5 characters) is required.');
    error.statusCode = 400;
    throw error;
  }

  let payment = null;
  let paymentDoc = null;

  if (isDatabaseConnected()) {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(paymentId);
      const filter = isObjectId ? { _id: paymentId } : { paymentReference: paymentId };
      paymentDoc = await CommissionPayment.findOne(filter);
      if (paymentDoc) {
        payment = paymentDoc.toObject();
      }
    } catch (err) {
      // proceed
    }
  }

  if (!payment) {
    payment = inMemoryCommissionPayments.get(paymentId);
    if (!payment) {
      for (const item of inMemoryCommissionPayments.values()) {
        if (item.paymentReference === paymentId || item._id === paymentId) {
          payment = item;
          break;
        }
      }
    }
  }

  if (!payment) {
    const error = new Error('Commission payment record not found.');
    error.statusCode = 404;
    throw error;
  }

  if (payment.isReversed) {
    const error = new Error('This payment entry has already been reversed.');
    error.statusCode = 400;
    throw error;
  }

  const reversedAt = new Date();
  const reversedBy = {
    adminId: adminUser.id,
    adminName: adminUser.fullName || 'Admin',
  };

  if (paymentDoc) {
    paymentDoc.isReversed = true;
    paymentDoc.status = 'cancelled';
    paymentDoc.reversalReason = cleanReason;
    paymentDoc.reversedAt = reversedAt;
    paymentDoc.reversedBy = reversedBy;
    await paymentDoc.save();

    // Adjust deal
    const dealDoc = await BrokerageDeal.findById(payment.dealId);
    if (dealDoc) {
      dealDoc.totalReceivedCommission = Math.max(0, (dealDoc.totalReceivedCommission || 0) - payment.amount);
      dealDoc.outstandingCommission = Math.max(
        0,
        dealDoc.commissionAgreement.agreedAmount - dealDoc.totalReceivedCommission
      );
      if (dealDoc.totalReceivedCommission === 0) {
        dealDoc.commissionAgreement.status = 'invoiced';
      } else {
        dealDoc.commissionAgreement.status = 'partially_collected';
      }
      await dealDoc.save();
    }
  } else {
    payment.isReversed = true;
    payment.status = 'cancelled';
    payment.reversalReason = cleanReason;
    payment.reversedAt = reversedAt.toISOString();
    payment.reversedBy = reversedBy;
    inMemoryCommissionPayments.set(payment.id || payment._id, payment);

    let memDeal = inMemoryDeals.get(payment.dealId) || inMemoryDeals.get(payment.dealReference);
    if (!memDeal) {
      for (const item of inMemoryDeals.values()) {
        if (item.id === payment.dealId || item._id === payment.dealId || item.dealReference === payment.dealReference) {
          memDeal = item;
          break;
        }
      }
    }
    if (memDeal) {
      memDeal.totalReceivedCommission = Math.max(0, (memDeal.totalReceivedCommission || 0) - payment.amount);
      memDeal.outstandingCommission = Math.max(
        0,
        memDeal.commissionAgreement.agreedAmount - memDeal.totalReceivedCommission
      );
      if (memDeal.totalReceivedCommission === 0) {
        memDeal.commissionAgreement.status = 'invoiced';
      } else {
        memDeal.commissionAgreement.status = 'partially_collected';
      }
      inMemoryDeals.set(memDeal.id || memDeal._id, memDeal);
    }
  }

  // Audit
  await logAdminActivity(adminUser, {
    action: 'commission_payment_reversed',
    targetType: 'commission_payment',
    targetId: payment.id || payment._id,
    targetTitle: payment.paymentReference,
    reason: cleanReason,
    metadata: {
      dealReference: payment.dealReference,
      reversedAmount: payment.amount,
    },
  });

  return formatPaymentOutput(payment);
}

export async function getGlobalCommissionLedger({
  page = 1,
  limit = 10,
  paymentMethod = '',
  status = '',
  range = 'all',
  startDate = '',
  endDate = '',
  sortBy = 'newest',
} = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;
  const dateFilter = resolveDateFilter(range, startDate, endDate);

  if (isDatabaseConnected()) {
    try {
      const query = {};
      if (paymentMethod) query.paymentMethod = paymentMethod;
      if (status) query.status = status;
      if (dateFilter) {
        query.paymentDate = { $gte: dateFilter.start, $lte: dateFilter.end };
      }

      const sortOrder = sortBy === 'oldest' ? { paymentDate: 1 } : { paymentDate: -1 };

      const [total, docs] = await Promise.all([
        CommissionPayment.countDocuments(query),
        CommissionPayment.find(query).sort(sortOrder).skip(skip).limit(l).lean(),
      ]);

      return {
        items: docs.map(formatPaymentOutput),
        pagination: {
          page: p,
          limit: l,
          total,
          totalPages: Math.ceil(total / l) || 1,
        },
      };
    } catch (err) {
      console.error('[BusinessService] Error querying MongoDB commission ledger:', err.message);
    }
  }

  let all = Array.from(inMemoryCommissionPayments.values());
  if (paymentMethod) all = all.filter((p) => p.paymentMethod === paymentMethod);
  if (status) all = all.filter((p) => p.status === status);
  if (dateFilter) {
    all = all.filter((p) => {
      const t = new Date(p.paymentDate || 0).getTime();
      return t >= dateFilter.start.getTime() && t <= dateFilter.end.getTime();
    });
  }

  all.sort((a, b) => {
    const timeA = new Date(a.paymentDate || 0).getTime();
    const timeB = new Date(b.paymentDate || 0).getTime();
    return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
  });

  const total = all.length;
  const paginated = all.slice(skip, skip + l);

  return {
    items: paginated.map(formatPaymentOutput),
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

// =================================================================
// 4. Company-Owned Property Financial Management
// =================================================================
export async function getCompanyPropertiesFinancials() {
  let properties = [];

  if (isDatabaseConnected()) {
    try {
      properties = await Property.find({ listingType: 'company_owned' })
        .select('+acquisitionCost +acquisitionDate +internalNotes +privateAddress')
        .lean();
    } catch (err) {
      // fallback
    }
  }

  if (properties.length === 0) {
    const memoryProps = [
      ...Array.from(inMemorySubmissionStore.values()),
      ...demoPropertiesData,
    ].filter((p) => p.listingType === 'company_owned');
    properties = memoryProps;
  }

  // Enrich each property with expenses and sale records
  const enriched = await Promise.all(
    properties.map(async (prop) => {
      const propId = prop.id || prop._id;
      const [expenses, sale] = await Promise.all([
        getPropertyExpenses(propId),
        getCompanyPropertySale(propId),
      ]);

      const acquisitionCost = prop.acquisitionCost || 0;
      const totalExpenses = expenses
        .filter((e) => !e.isReversed)
        .reduce((sum, e) => sum + e.amount, 0);
      const totalInvestment = acquisitionCost + totalExpenses;

      let saleMetrics = null;
      if (sale) {
        saleMetrics = {
          saleReference: sale.saleReference,
          saleDate: sale.saleDate,
          saleAmount: sale.saleAmount,
          saleAmountFormatted: formatIndianPrice(sale.saleAmount),
          paymentReceived: sale.paymentReceived,
          outstandingBalance: sale.outstandingBalance,
          paymentStatus: sale.paymentStatus,
          buyerName: sale.buyer?.name,
          grossProfit: sale.grossProfit,
          grossProfitFormatted: formatIndianPrice(sale.grossProfit),
          grossMarginPercentage: sale.grossMarginPercentage,
        };
      }

      return {
        id: propId,
        title: prop.title,
        slug: prop.slug,
        city: prop.city,
        locality: prop.locality,
        availabilityStatus: prop.availabilityStatus,
        acquisitionCost,
        acquisitionCostFormatted: formatIndianPrice(acquisitionCost),
        acquisitionDate: prop.acquisitionDate,
        totalExpenses,
        totalExpensesFormatted: formatIndianPrice(totalExpenses),
        totalInvestment,
        totalInvestmentFormatted: formatIndianPrice(totalInvestment),
        expenseCount: expenses.length,
        sale: saleMetrics,
      };
    })
  );

  return enriched;
}

export async function getPropertyExpenses(propertyId) {
  if (isDatabaseConnected()) {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(propertyId);
      const filter = isObjectId ? { propertyId } : { propertyTitle: new RegExp(propertyId, 'i') };
      const expenses = await PropertyExpense.find(filter).sort({ date: -1 }).lean();
      return expenses.map(formatExpenseOutput);
    } catch (err) {
      // proceed
    }
  }

  const list = Array.from(inMemoryPropertyExpenses.values()).filter(
    (e) => e.propertyId === propertyId
  );
  list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return list.map(formatExpenseOutput);
}

export async function recordPropertyExpense(adminUser, propertyId, expenseData) {
  const {
    category,
    amount,
    date = new Date(),
    vendor = '',
    description = '',
    receiptReference = '',
    paymentMethod = 'bank_transfer',
  } = expenseData;

  const cleanAmount = Math.round(Number(amount));
  if (isNaN(cleanAmount) || cleanAmount <= 0) {
    const error = new Error('Expense amount must be a positive number.');
    error.statusCode = 400;
    throw error;
  }

  const VALID_CATEGORIES = [
    'registration',
    'legal_documentation',
    'renovation',
    'repair_maintenance',
    'brokerage_paid',
    'marketing',
    'interior_work',
    'utilities',
    'other',
  ];
  if (!VALID_CATEGORIES.includes(category)) {
    const error = new Error(`Invalid expense category. Allowed: ${VALID_CATEGORIES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  // Lookup property title
  let propertyTitle = '';
  if (isDatabaseConnected()) {
    try {
      const p = await Property.findById(propertyId).lean();
      if (p) propertyTitle = p.title;
    } catch (err) {
      // proceed
    }
  }
  if (!propertyTitle) {
    const match = [
      ...Array.from(inMemorySubmissionStore.values()),
      ...demoPropertiesData,
    ].find((p) => p.id === propertyId || p.demoId === propertyId || p._id === propertyId);
    if (match) propertyTitle = match.title;
  }

  const expenseReference = generateReference('EXP');

  const newExpense = {
    expenseReference,
    propertyId,
    propertyTitle: propertyTitle || 'Company Asset',
    category,
    amount: cleanAmount,
    currency: 'INR',
    date: new Date(date),
    vendor: (vendor || '').trim(),
    description: (description || '').trim(),
    receiptReference: (receiptReference || '').trim(),
    paymentMethod,
    isReversed: false,
    recordedBy: {
      adminId: adminUser.id,
      adminName: adminUser.fullName || 'Admin',
      adminEmail: adminUser.email || '',
    },
  };

  let savedExpense;

  if (isDatabaseConnected()) {
    try {
      const doc = await PropertyExpense.create(newExpense);
      savedExpense = formatExpenseOutput(doc.toObject());
    } catch (err) {
      console.error('[BusinessService] Error recording MongoDB property expense:', err.message);
    }
  }

  if (!savedExpense) {
    const memoryId = `exp_${Date.now()}`;
    savedExpense = {
      id: memoryId,
      _id: memoryId,
      ...newExpense,
      date: newExpense.date.toISOString(),
      createdAt: new Date().toISOString(),
    };
    inMemoryPropertyExpenses.set(memoryId, savedExpense);
  }

  // Audit
  await logAdminActivity(adminUser, {
    action: 'property_expense_created',
    targetType: 'property_expense',
    targetId: savedExpense.id || savedExpense._id,
    targetTitle: savedExpense.expenseReference,
    metadata: {
      propertyTitle,
      category,
      amount: cleanAmount,
    },
  });

  return savedExpense;
}

export async function reversePropertyExpense(adminUser, expenseId, { reason = '' } = {}) {
  const cleanReason = (reason || '').trim();
  if (!cleanReason || cleanReason.length < 5) {
    const error = new Error('A detailed reversal reason (at least 5 characters) is required.');
    error.statusCode = 400;
    throw error;
  }

  let expense = null;
  let expenseDoc = null;

  if (isDatabaseConnected()) {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(expenseId);
      const filter = isObjectId ? { _id: expenseId } : { expenseReference: expenseId };
      expenseDoc = await PropertyExpense.findOne(filter);
      if (expenseDoc) {
        expense = expenseDoc.toObject();
      }
    } catch (err) {
      // proceed
    }
  }

  if (!expense) {
    expense = inMemoryPropertyExpenses.get(expenseId);
    if (!expense) {
      for (const item of inMemoryPropertyExpenses.values()) {
        if (item.expenseReference === expenseId || item._id === expenseId) {
          expense = item;
          break;
        }
      }
    }
  }

  if (!expense) {
    const error = new Error('Property expense record not found.');
    error.statusCode = 404;
    throw error;
  }

  if (expense.isReversed) {
    const error = new Error('This property expense entry has already been reversed.');
    error.statusCode = 400;
    throw error;
  }

  const reversedAt = new Date();
  const reversedBy = {
    adminId: adminUser.id,
    adminName: adminUser.fullName || 'Admin',
  };

  if (expenseDoc) {
    expenseDoc.isReversed = true;
    expenseDoc.reversalReason = cleanReason;
    expenseDoc.reversedAt = reversedAt;
    expenseDoc.reversedBy = reversedBy;
    await expenseDoc.save();
  } else {
    expense.isReversed = true;
    expense.reversalReason = cleanReason;
    expense.reversedAt = reversedAt.toISOString();
    expense.reversedBy = reversedBy;
    inMemoryPropertyExpenses.set(expense.id || expense._id, expense);
  }

  // Audit
  await logAdminActivity(adminUser, {
    action: 'property_expense_reversed',
    targetType: 'property_expense',
    targetId: expense.id || expense._id,
    targetTitle: expense.expenseReference,
    reason: cleanReason,
    metadata: {
      reversedAmount: expense.amount,
      propertyId: expense.propertyId,
    },
  });

  return formatExpenseOutput(expense);
}

// =================================================================
// 5. Company-Owned Property Sale Management
// =================================================================
export async function getCompanyPropertySale(propertyId) {
  if (isDatabaseConnected()) {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(propertyId);
      const filter = isObjectId ? { propertyId } : { propertyTitle: new RegExp(propertyId, 'i') };
      const sale = await CompanyPropertySale.findOne(filter).lean();
      return sale ? formatSaleOutput(sale) : null;
    } catch (err) {
      // proceed
    }
  }

  for (const item of inMemoryCompanySales.values()) {
    if (item.propertyId === propertyId) {
      return formatSaleOutput(item);
    }
  }
  return null;
}

export async function recordCompanyPropertySale(adminUser, propertyId, saleData) {
  const {
    buyer,
    saleDate = new Date(),
    saleAmount,
    agreementReference,
    paymentReceived = 0,
    internalRemarks = '',
  } = saleData;

  const cleanSaleAmount = Math.round(Number(saleAmount));
  if (isNaN(cleanSaleAmount) || cleanSaleAmount <= 0) {
    const error = new Error('Sale amount must be a positive number.');
    error.statusCode = 400;
    throw error;
  }

  if (!buyer || !buyer.name || buyer.name.trim().length < 2) {
    const error = new Error('Buyer full legal name is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!agreementReference || agreementReference.trim().length < 3) {
    const error = new Error('Sale deed / agreement reference is required.');
    error.statusCode = 400;
    throw error;
  }

  // Ensure property exists and retrieve acquisition cost
  let property = null;
  let propertyTitle = '';
  let acquisitionCost = 0;

  if (isDatabaseConnected()) {
    try {
      property = await Property.findById(propertyId).select('+acquisitionCost').lean();
      if (property) {
        propertyTitle = property.title;
        acquisitionCost = property.acquisitionCost || 0;
      }
    } catch (err) {
      // proceed
    }
  }

  if (!property) {
    const match = [
      ...Array.from(inMemorySubmissionStore.values()),
      ...demoPropertiesData,
    ].find((p) => p.id === propertyId || p.demoId === propertyId || p._id === propertyId);
    if (match) {
      property = match;
      propertyTitle = match.title;
      acquisitionCost = match.acquisitionCost || 0;
    }
  }

  if (!property) {
    const error = new Error('Company property record not found.');
    error.statusCode = 404;
    throw error;
  }

  // Fetch recorded expenses
  const expenses = await getPropertyExpenses(propertyId);
  const totalExpenses = expenses
    .filter((e) => !e.isReversed)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalInvestment = acquisitionCost + totalExpenses;
  const grossProfit = cleanSaleAmount - totalInvestment;
  const grossMarginPercentage =
    cleanSaleAmount > 0 ? Number(((grossProfit / cleanSaleAmount) * 100).toFixed(2)) : 0;

  const cleanPaymentReceived = Math.min(cleanSaleAmount, Math.max(0, Math.round(Number(paymentReceived) || 0)));
  const outstandingBalance = Math.max(0, cleanSaleAmount - cleanPaymentReceived);
  const paymentStatus =
    outstandingBalance === 0 ? 'fully_paid' : cleanPaymentReceived > 0 ? 'partially_paid' : 'pending';

  const saleReference = generateReference('SALE');

  const newSale = {
    saleReference,
    propertyId,
    propertyTitle,
    buyer: {
      name: buyer.name.trim(),
      phone: (buyer.phone || '').trim(),
      email: (buyer.email || '').trim().toLowerCase(),
      address: (buyer.address || '').trim(),
    },
    saleDate: new Date(saleDate),
    saleAmount: cleanSaleAmount,
    currency: 'INR',
    agreementReference: agreementReference.trim(),
    paymentReceived: cleanPaymentReceived,
    outstandingBalance,
    paymentStatus,
    acquisitionCost,
    totalExpenses,
    totalInvestment,
    grossProfit,
    grossMarginPercentage,
    internalRemarks: (internalRemarks || '').trim(),
    recordedBy: {
      adminId: adminUser.id,
      adminName: adminUser.fullName || 'Admin',
      adminEmail: adminUser.email || '',
    },
  };

  let savedSale;

  if (isDatabaseConnected()) {
    try {
      const doc = await CompanyPropertySale.create(newSale);
      savedSale = formatSaleOutput(doc.toObject());

      // Mark property as sold
      await Property.findByIdAndUpdate(propertyId, {
        $set: {
          availabilityStatus: 'sold',
          availabilityLabel: 'Sold',
        },
      });
    } catch (err) {
      console.error('[BusinessService] Error recording MongoDB company property sale:', err.message);
    }
  }

  if (!savedSale) {
    const memoryId = `sale_${Date.now()}`;
    savedSale = {
      id: memoryId,
      _id: memoryId,
      ...newSale,
      saleDate: newSale.saleDate.toISOString(),
      createdAt: new Date().toISOString(),
    };
    inMemoryCompanySales.set(memoryId, savedSale);

    // Update in-memory property status to sold
    if (inMemorySubmissionStore.has(propertyId)) {
      const p = inMemorySubmissionStore.get(propertyId);
      p.availabilityStatus = 'sold';
      p.availabilityLabel = 'Sold';
    }
  }

  // Audit
  await logAdminActivity(adminUser, {
    action: 'company_sale_recorded',
    targetType: 'company_sale',
    targetId: savedSale.id || savedSale._id,
    targetTitle: savedSale.saleReference,
    metadata: {
      propertyTitle,
      saleAmount: cleanSaleAmount,
      totalInvestment,
      grossProfit,
      grossMarginPercentage,
    },
  });

  return savedSale;
}

// =================================================================
// 6. Business Expense Management
// =================================================================
export async function getBusinessExpenses({
  page = 1,
  limit = 10,
  category = '',
  range = 'all',
  startDate = '',
  endDate = '',
  sortBy = 'newest',
} = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;
  const dateFilter = resolveDateFilter(range, startDate, endDate);

  if (isDatabaseConnected()) {
    try {
      const query = {};
      if (category) query.category = category;
      if (dateFilter) {
        query.date = { $gte: dateFilter.start, $lte: dateFilter.end };
      }

      const sortOrder = sortBy === 'oldest' ? { date: 1 } : { date: -1 };

      const [total, docs] = await Promise.all([
        BusinessExpense.countDocuments(query),
        BusinessExpense.find(query).sort(sortOrder).skip(skip).limit(l).lean(),
      ]);

      return {
        items: docs.map(formatBusinessExpenseOutput),
        pagination: {
          page: p,
          limit: l,
          total,
          totalPages: Math.ceil(total / l) || 1,
        },
      };
    } catch (err) {
      console.error('[BusinessService] Error querying MongoDB business expenses:', err.message);
    }
  }

  let all = Array.from(inMemoryBusinessExpenses.values());
  if (category) all = all.filter((b) => b.category === category);
  if (dateFilter) {
    all = all.filter((b) => {
      const t = new Date(b.date || 0).getTime();
      return t >= dateFilter.start.getTime() && t <= dateFilter.end.getTime();
    });
  }

  all.sort((a, b) => {
    const timeA = new Date(a.date || 0).getTime();
    const timeB = new Date(b.date || 0).getTime();
    return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
  });

  const total = all.length;
  const paginated = all.slice(skip, skip + l);

  return {
    items: paginated.map(formatBusinessExpenseOutput),
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

export async function recordBusinessExpense(adminUser, expenseData) {
  const {
    title,
    category,
    amount,
    date = new Date(),
    vendor = '',
    paymentMethod = 'bank_transfer',
    referenceNumber = '',
    description = '',
    receiptReference = '',
  } = expenseData;

  if (!title || title.trim().length < 3) {
    const error = new Error('Expense title must be at least 3 characters.');
    error.statusCode = 400;
    throw error;
  }

  const cleanAmount = Math.round(Number(amount));
  if (isNaN(cleanAmount) || cleanAmount <= 0) {
    const error = new Error('Expense amount must be a positive number.');
    error.statusCode = 400;
    throw error;
  }

  const VALID_CATEGORIES = [
    'office_rent',
    'staff_costs',
    'software_subscriptions',
    'marketing',
    'travel',
    'utilities',
    'professional_services',
    'other',
  ];
  if (!VALID_CATEGORIES.includes(category)) {
    const error = new Error(`Invalid category. Allowed: ${VALID_CATEGORIES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const expenseReference = generateReference('BEXP');

  const newExpense = {
    expenseReference,
    title: title.trim(),
    category,
    amount: cleanAmount,
    currency: 'INR',
    date: new Date(date),
    vendor: (vendor || '').trim(),
    paymentMethod,
    referenceNumber: (referenceNumber || '').trim(),
    description: (description || '').trim(),
    receiptReference: (receiptReference || '').trim(),
    isReversed: false,
    recordedBy: {
      adminId: adminUser.id,
      adminName: adminUser.fullName || 'Admin',
      adminEmail: adminUser.email || '',
    },
  };

  let savedExpense;

  if (isDatabaseConnected()) {
    try {
      const doc = await BusinessExpense.create(newExpense);
      savedExpense = formatBusinessExpenseOutput(doc.toObject());
    } catch (err) {
      console.error('[BusinessService] Error creating MongoDB business expense:', err.message);
    }
  }

  if (!savedExpense) {
    const memoryId = `bexp_${Date.now()}`;
    savedExpense = {
      id: memoryId,
      _id: memoryId,
      ...newExpense,
      date: newExpense.date.toISOString(),
      createdAt: new Date().toISOString(),
    };
    inMemoryBusinessExpenses.set(memoryId, savedExpense);
  }

  // Audit
  await logAdminActivity(adminUser, {
    action: 'business_expense_created',
    targetType: 'business_expense',
    targetId: savedExpense.id || savedExpense._id,
    targetTitle: savedExpense.expenseReference,
    metadata: {
      title,
      category,
      amount: cleanAmount,
    },
  });

  return savedExpense;
}

export async function reverseBusinessExpense(adminUser, expenseId, { reason = '' } = {}) {
  const cleanReason = (reason || '').trim();
  if (!cleanReason || cleanReason.length < 5) {
    const error = new Error('A detailed reversal reason (at least 5 characters) is required.');
    error.statusCode = 400;
    throw error;
  }

  let expense = null;
  let expenseDoc = null;

  if (isDatabaseConnected()) {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(expenseId);
      const filter = isObjectId ? { _id: expenseId } : { expenseReference: expenseId };
      expenseDoc = await BusinessExpense.findOne(filter);
      if (expenseDoc) {
        expense = expenseDoc.toObject();
      }
    } catch (err) {
      // proceed
    }
  }

  if (!expense) {
    expense = inMemoryBusinessExpenses.get(expenseId);
    if (!expense) {
      for (const item of inMemoryBusinessExpenses.values()) {
        if (item.expenseReference === expenseId || item._id === expenseId) {
          expense = item;
          break;
        }
      }
    }
  }

  if (!expense) {
    const error = new Error('Business expense record not found.');
    error.statusCode = 404;
    throw error;
  }

  if (expense.isReversed) {
    const error = new Error('This business expense has already been reversed.');
    error.statusCode = 400;
    throw error;
  }

  const reversedAt = new Date();
  const reversedBy = {
    adminId: adminUser.id,
    adminName: adminUser.fullName || 'Admin',
  };

  if (expenseDoc) {
    expenseDoc.isReversed = true;
    expenseDoc.reversalReason = cleanReason;
    expenseDoc.reversedAt = reversedAt;
    expenseDoc.reversedBy = reversedBy;
    await expenseDoc.save();
  } else {
    expense.isReversed = true;
    expense.reversalReason = cleanReason;
    expense.reversedAt = reversedAt.toISOString();
    expense.reversedBy = reversedBy;
    inMemoryBusinessExpenses.set(expense.id || expense._id, expense);
  }

  // Audit
  await logAdminActivity(adminUser, {
    action: 'business_expense_reversed',
    targetType: 'business_expense',
    targetId: expense.id || expense._id,
    targetTitle: expense.expenseReference,
    reason: cleanReason,
    metadata: {
      reversedAmount: expense.amount,
      title: expense.title,
    },
  });

  return formatBusinessExpenseOutput(expense);
}

// =================================================================
// 7. Financial Reports & Analytics
// =================================================================
export async function getFinancialReports({ range = 'all', startDate = '', endDate = '' } = {}) {
  const overview = await getBusinessOverview({ range, startDate, endDate });
  const dateFilter = resolveDateFilter(range, startDate, endDate);

  // Group deals by status
  let deals = Array.from(inMemoryDeals.values());
  if (isDatabaseConnected()) {
    try {
      const q = dateFilter ? { dealDate: { $gte: dateFilter.start, $lte: dateFilter.end } } : {};
      deals = await BrokerageDeal.find(q).lean();
    } catch (e) {
      // fallback
    }
  }

  const dealsByStatus = {};
  deals.forEach((d) => {
    dealsByStatus[d.status] = (dealsByStatus[d.status] || 0) + 1;
  });

  // Commission by Payer
  const commissionByPayer = {
    seller: 0,
    buyer: 0,
    both: 0,
    other: 0,
  };
  deals.forEach((d) => {
    const p = d.commissionAgreement?.payer || 'seller';
    commissionByPayer[p] = (commissionByPayer[p] || 0) + (d.commissionAgreement?.agreedAmount || 0);
  });

  // Business Expenses by Category
  let bExpenses = Array.from(inMemoryBusinessExpenses.values()).filter((e) => !e.isReversed);
  if (isDatabaseConnected()) {
    try {
      const q = { isReversed: false };
      if (dateFilter) q.date = { $gte: dateFilter.start, $lte: dateFilter.end };
      bExpenses = await BusinessExpense.find(q).lean();
    } catch (e) {
      // fallback
    }
  }

  const expensesByCategory = {};
  bExpenses.forEach((e) => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
  });

  return {
    overview: overview.metrics,
    filter: overview.filter,
    databaseStatus: overview.databaseStatus,
    brokerageReports: {
      dealsByStatus,
      commissionByPayer,
    },
    businessExpenseReports: {
      expensesByCategory,
    },
  };
}

// =================================================================
// 8. CSV Report Exports (Secure, Authenticated)
// =================================================================
export async function exportFinancialReportCsv(adminUser, reportType, { range = 'all', startDate = '', endDate = '' } = {}) {
  const VALID_REPORTS = [
    'brokerage_deals',
    'commission_ledger',
    'company_sales',
    'business_expenses',
  ];

  if (!VALID_REPORTS.includes(reportType)) {
    const error = new Error(`Invalid report type. Allowed: ${VALID_REPORTS.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  let csvContent = '';
  let filename = `masterji_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

  if (reportType === 'brokerage_deals') {
    const dealsData = await getBrokerageDeals({ limit: 500, range, startDate, endDate });
    const rows = [
      [
        'Deal Reference',
        'Property Title',
        'City',
        'Seller Name',
        'Buyer Name',
        'Status',
        'Expected Value (INR)',
        'Actual Value (INR)',
        'Commission Type',
        'Agreed Commission (INR)',
        'Commission Received (INR)',
        'Outstanding (INR)',
        'Deal Date',
      ],
    ];

    dealsData.items.forEach((d) => {
      rows.push([
        escapeCsv(d.dealReference),
        escapeCsv(d.propertyTitle),
        escapeCsv(d.propertyCity),
        escapeCsv(d.seller?.name),
        escapeCsv(d.buyer?.name),
        escapeCsv(d.status),
        d.expectedTransactionValue,
        d.actualTransactionValue,
        d.commissionAgreement?.commissionType,
        d.commissionAgreement?.agreedAmount,
        d.totalReceivedCommission,
        d.outstandingCommission,
        d.dealDate ? new Date(d.dealDate).toISOString().slice(0, 10) : '',
      ]);
    });

    csvContent = rows.map((r) => r.join(',')).join('\n');
  } else if (reportType === 'commission_ledger') {
    const ledgerData = await getGlobalCommissionLedger({ limit: 500, range, startDate, endDate });
    const rows = [
      [
        'Payment Reference',
        'Deal Reference',
        'Property Title',
        'Amount (INR)',
        'Payment Date',
        'Payment Method',
        'Transaction / UTR Number',
        'Received From',
        'Payer Name',
        'Status',
      ],
    ];

    ledgerData.items.forEach((p) => {
      rows.push([
        escapeCsv(p.paymentReference),
        escapeCsv(p.dealReference),
        escapeCsv(p.propertyTitle),
        p.amount,
        p.paymentDate ? new Date(p.paymentDate).toISOString().slice(0, 10) : '',
        escapeCsv(p.paymentMethod),
        escapeCsv(p.transactionNumber),
        escapeCsv(p.receivedFrom),
        escapeCsv(p.payerName),
        escapeCsv(p.status),
      ]);
    });

    csvContent = rows.map((r) => r.join(',')).join('\n');
  } else if (reportType === 'company_sales') {
    const companyFinancials = await getCompanyPropertiesFinancials();
    const rows = [
      [
        'Property Title',
        'City',
        'Acquisition Cost (INR)',
        'Total Expenses (INR)',
        'Total Investment (INR)',
        'Sale Status',
        'Sale Amount (INR)',
        'Gross Profit (INR)',
        'Gross Margin %',
        'Sale Date',
      ],
    ];

    companyFinancials.forEach((c) => {
      rows.push([
        escapeCsv(c.title),
        escapeCsv(c.city),
        c.acquisitionCost,
        c.totalExpenses,
        c.totalInvestment,
        escapeCsv(c.availabilityStatus),
        c.sale ? c.sale.saleAmount : 0,
        c.sale ? c.sale.grossProfit : 0,
        c.sale ? c.sale.grossMarginPercentage : 0,
        c.sale && c.sale.saleDate ? new Date(c.sale.saleDate).toISOString().slice(0, 10) : '',
      ]);
    });

    csvContent = rows.map((r) => r.join(',')).join('\n');
  } else if (reportType === 'business_expenses') {
    const expensesData = await getBusinessExpenses({ limit: 500, range, startDate, endDate });
    const rows = [
      [
        'Expense Reference',
        'Title',
        'Category',
        'Amount (INR)',
        'Date',
        'Vendor',
        'Payment Method',
        'Reference Number',
        'Status',
      ],
    ];

    expensesData.items.forEach((e) => {
      rows.push([
        escapeCsv(e.expenseReference),
        escapeCsv(e.title),
        escapeCsv(e.category),
        e.amount,
        e.date ? new Date(e.date).toISOString().slice(0, 10) : '',
        escapeCsv(e.vendor),
        escapeCsv(e.paymentMethod),
        escapeCsv(e.referenceNumber),
        escapeCsv(e.isReversed ? 'Reversed' : 'Active'),
      ]);
    });

    csvContent = rows.map((r) => r.join(',')).join('\n');
  }

  // Audit
  await logAdminActivity(adminUser, {
    action: 'financial_report_exported',
    targetType: 'financial_report',
    targetId: reportType,
    targetTitle: filename,
    metadata: {
      reportType,
      range,
    },
  });

  return {
    filename,
    csvContent,
  };
}

function escapeCsv(field) {
  if (field === null || field === undefined) return '""';
  let str = String(field);
  // Protect against CSV / Spreadsheet formula injection (OWASP CSV Injection)
  // Prefixes formula triggers with a single quote so spreadsheet engines treat them as plain text.
  if (/^[=+\-@\t\r%]/.test(str)) {
    str = `'${str}`;
  }
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

// =================================================================
// Serializers / Formatters
// =================================================================
function formatDealOutput(deal) {
  const id = deal.id || deal._id?.toString();
  return {
    id,
    _id: id,
    dealReference: deal.dealReference,
    propertyId: deal.propertyId,
    propertyTitle: deal.propertyTitle,
    propertySlug: deal.propertySlug,
    propertyCity: deal.propertyCity,
    seller: deal.seller || {},
    buyer: deal.buyer || {},
    enquiryId: deal.enquiryId,
    status: deal.status,
    expectedTransactionValue: deal.expectedTransactionValue || 0,
    expectedTransactionValueFormatted: formatIndianPrice(deal.expectedTransactionValue || 0),
    actualTransactionValue: deal.actualTransactionValue || 0,
    actualTransactionValueFormatted: formatIndianPrice(deal.actualTransactionValue || 0),
    currency: deal.currency || 'INR',
    dealDate: deal.dealDate,
    expectedClosingDate: deal.expectedClosingDate,
    actualClosingDate: deal.actualClosingDate,
    responsibleAdmin: deal.responsibleAdmin || {},
    internalNotes: deal.internalNotes || '',
    commissionAgreement: {
      ...deal.commissionAgreement,
      agreedAmountFormatted: formatIndianPrice(deal.commissionAgreement?.agreedAmount || 0),
      buyerShareFormatted: formatIndianPrice(deal.commissionAgreement?.buyerShare || 0),
      sellerShareFormatted: formatIndianPrice(deal.commissionAgreement?.sellerShare || 0),
    },
    totalReceivedCommission: deal.totalReceivedCommission || 0,
    totalReceivedCommissionFormatted: formatIndianPrice(deal.totalReceivedCommission || 0),
    outstandingCommission: deal.outstandingCommission || 0,
    outstandingCommissionFormatted: formatIndianPrice(deal.outstandingCommission || 0),
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
  };
}

function formatPaymentOutput(payment) {
  const id = payment.id || payment._id?.toString();
  return {
    id,
    _id: id,
    paymentReference: payment.paymentReference,
    dealId: payment.dealId,
    dealReference: payment.dealReference,
    propertyTitle: payment.propertyTitle,
    amount: payment.amount,
    amountFormatted: formatIndianPrice(payment.amount),
    currency: payment.currency || 'INR',
    paymentDate: payment.paymentDate,
    paymentMethod: payment.paymentMethod,
    transactionNumber: payment.transactionNumber,
    receivedFrom: payment.receivedFrom,
    payerName: payment.payerName,
    status: payment.status,
    isReversed: Boolean(payment.isReversed),
    reversalReason: payment.reversalReason || '',
    reversedAt: payment.reversedAt,
    reversedBy: payment.reversedBy,
    recordedBy: payment.recordedBy,
    internalRemarks: payment.internalRemarks,
    createdAt: payment.createdAt,
  };
}

function formatExpenseOutput(expense) {
  const id = expense.id || expense._id?.toString();
  return {
    id,
    _id: id,
    expenseReference: expense.expenseReference,
    propertyId: expense.propertyId,
    propertyTitle: expense.propertyTitle,
    category: expense.category,
    amount: expense.amount,
    amountFormatted: formatIndianPrice(expense.amount),
    currency: expense.currency || 'INR',
    date: expense.date,
    vendor: expense.vendor,
    description: expense.description,
    receiptReference: expense.receiptReference,
    paymentMethod: expense.paymentMethod,
    isReversed: Boolean(expense.isReversed),
    reversalReason: expense.reversalReason || '',
    reversedAt: expense.reversedAt,
    reversedBy: expense.reversedBy,
    recordedBy: expense.recordedBy,
    createdAt: expense.createdAt,
  };
}

function formatSaleOutput(sale) {
  const id = sale.id || sale._id?.toString();
  return {
    id,
    _id: id,
    saleReference: sale.saleReference,
    propertyId: sale.propertyId,
    propertyTitle: sale.propertyTitle,
    buyer: sale.buyer,
    saleDate: sale.saleDate,
    saleAmount: sale.saleAmount,
    saleAmountFormatted: formatIndianPrice(sale.saleAmount),
    currency: sale.currency || 'INR',
    agreementReference: sale.agreementReference,
    paymentReceived: sale.paymentReceived,
    paymentReceivedFormatted: formatIndianPrice(sale.paymentReceived),
    outstandingBalance: sale.outstandingBalance,
    outstandingBalanceFormatted: formatIndianPrice(sale.outstandingBalance),
    paymentStatus: sale.paymentStatus,
    acquisitionCost: sale.acquisitionCost,
    acquisitionCostFormatted: formatIndianPrice(sale.acquisitionCost),
    totalExpenses: sale.totalExpenses,
    totalExpensesFormatted: formatIndianPrice(sale.totalExpenses),
    totalInvestment: sale.totalInvestment,
    totalInvestmentFormatted: formatIndianPrice(sale.totalInvestment),
    grossProfit: sale.grossProfit,
    grossProfitFormatted: formatIndianPrice(sale.grossProfit),
    grossMarginPercentage: sale.grossMarginPercentage,
    internalRemarks: sale.internalRemarks,
    recordedBy: sale.recordedBy,
    createdAt: sale.createdAt,
  };
}

function formatBusinessExpenseOutput(bExpense) {
  const id = bExpense.id || bExpense._id?.toString();
  return {
    id,
    _id: id,
    expenseReference: bExpense.expenseReference,
    title: bExpense.title,
    category: bExpense.category,
    amount: bExpense.amount,
    amountFormatted: formatIndianPrice(bExpense.amount),
    currency: bExpense.currency || 'INR',
    date: bExpense.date,
    vendor: bExpense.vendor,
    paymentMethod: bExpense.paymentMethod,
    referenceNumber: bExpense.referenceNumber,
    description: bExpense.description,
    receiptReference: bExpense.receiptReference,
    isReversed: Boolean(bExpense.isReversed),
    reversalReason: bExpense.reversalReason || '',
    reversedAt: bExpense.reversedAt,
    reversedBy: bExpense.reversedBy,
    recordedBy: bExpense.recordedBy,
    createdAt: bExpense.createdAt,
  };
}

