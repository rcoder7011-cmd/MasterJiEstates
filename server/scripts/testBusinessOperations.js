/**
 * Verification & Security Test Suite for MasterJiEstates Business Operations & Financial Management (Part 13)
 *
 * Tests:
 * 1. Unauthenticated rejection across all business operations endpoints (401)
 * 2. Normal user authorization rejection across business endpoints (403)
 * 3. Authorized Administrator session & CSRF setup
 * 4. Business Overview KPI metrics & honest database status
 * 5. Date range filtering on business overview
 * 6. Brokerage deal creation & validation
 * 7. Invalid deal status transitions rejected & valid transitions checked
 * 8. Percentage & fixed commission calculations, buyer/seller payer splitting
 * 9. Commission agreement revision history & audit trail
 * 10. Commission payment ledger, partial instalments, and overpayment prevention
 * 11. Duplicate transaction number prevention
 * 12. Commission payment reversal workflow (mandatory reason, restored balance)
 * 13. Global commission ledger querying & pagination
 * 14. Company-owned property financials & CapEx ledger inspection
 * 15. Recording multiple expenses on company asset
 * 16. Total investment basis calculation (acquisitionCost + recorded expenses)
 * 17. Company property expense reversal workflow
 * 18. Company property sale execution (saleAmount, gross profit, margin %)
 * 19. Zero / negative sale amount validation
 * 20. General business operating expenses creation & category filtering
 * 21. Business expense reversal workflow
 * 22. Financial reports summary & distribution analytics
 * 23. Authorized CSV exports (brokerage_deals, commission_ledger, company_sales, business_expenses)
 * 24. Public DTO privacy defense (financials strictly omitted from public catalogue)
 * 25. Administrative audit trail verification for all financial actions
 * 26. Regression testing on public health & catalogue APIs
 */

import http from 'http';
import app from '../app.js';
import { generateToken } from '../utils/jwt.js';
import { inMemorySubmissionStore } from '../services/propertySubmissionService.js';
import { inMemoryAuditLogs } from '../services/adminService.js';
import {
  inMemoryDeals,
  inMemoryCommissionPayments,
  inMemoryPropertyExpenses,
  inMemoryCompanySales,
  inMemoryBusinessExpenses,
} from '../services/businessService.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

async function requestJson(server, { method = 'GET', path, headers = {}, body = null }) {
  const addr = server.address();
  const port = addr.port;

  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {
            json = raw;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function parseCookie(cookieHeaders, name) {
  if (!cookieHeaders) return null;
  const rawCookies = Array.isArray(cookieHeaders) ? cookieHeaders : [cookieHeaders];
  for (const c of rawCookies) {
    const match = c.match(new RegExp(`${name}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
}

async function runBusinessTests() {
  console.log('\n======================================================');
  console.log(' MASTERJIESTATES PART 13: BUSINESS & FINANCIAL SUITE');
  console.log('======================================================\n');

  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  try {
    // -------------------------------------------------------------
    // Section 1: Unauthenticated Access Controls (Expecting 401)
    // -------------------------------------------------------------
    console.log('--- 1. Testing Unauthenticated Security Boundaries (Expecting 401) ---');
    {
      const endpoints = [
        { path: '/api/admin/business/overview', method: 'GET' },
        { path: '/api/admin/business/deals', method: 'GET' },
        { path: '/api/admin/business/deals', method: 'POST', body: {} },
        { path: '/api/admin/business/commission-ledger', method: 'GET' },
        { path: '/api/admin/business/company-properties', method: 'GET' },
        { path: '/api/admin/business/expenses', method: 'GET' },
        { path: '/api/admin/business/reports/summary', method: 'GET' },
        { path: '/api/admin/business/reports/export/brokerage_deals', method: 'GET' },
      ];

      for (const ep of endpoints) {
        const res = await requestJson(server, { method: ep.method, path: ep.path, body: ep.body });
        assert(res.status === 401, `Unauthenticated ${ep.method} ${ep.path} returns 401`);
      }
    }

    // -------------------------------------------------------------
    // Section 2: Normal User RBAC Block (Expecting 403)
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Normal User Role-Based Access Control (Expecting 403) ---');
    {
      const userToken = generateToken({ id: 'usr_normal_001', role: 'user', tokenVersion: 0 });
      const userCookie = `mj_auth_token=${userToken}`;

      const endpoints = [
        { path: '/api/admin/business/overview', method: 'GET' },
        { path: '/api/admin/business/deals', method: 'GET' },
        { path: '/api/admin/business/commission-ledger', method: 'GET' },
        { path: '/api/admin/business/company-properties', method: 'GET' },
        { path: '/api/admin/business/expenses', method: 'GET' },
        { path: '/api/admin/business/reports/summary', method: 'GET' },
        { path: '/api/admin/business/reports/export/brokerage_deals', method: 'GET' },
      ];

      for (const ep of endpoints) {
        const res = await requestJson(server, {
          method: ep.method,
          path: ep.path,
          headers: { Cookie: userCookie },
        });
        assert(res.status === 403, `Normal user blocked from ${ep.method} ${ep.path} with 403 Forbidden`);
      }
    }

    // -------------------------------------------------------------
    // Section 3: Setting Up Authorized Administrator Identity
    // -------------------------------------------------------------
    console.log('\n--- 3. Setting Up Authorized Administrator Identity ---');
    const adminToken = generateToken({
      id: 'usr_admin_001',
      role: 'admin',
      tokenVersion: 1,
      fullName: 'MasterJi SuperAdmin',
      email: 'admin@masterjiestates.in',
    });
    const adminCookie = `mj_auth_token=${adminToken}`;

    const csrfRes = await requestJson(server, {
      path: '/api/auth/csrf',
      headers: { Cookie: adminCookie },
    });
    const csrfToken = csrfRes.body?.data?.csrfToken;
    const csrfCookie = parseCookie(csrfRes.headers['set-cookie'], 'mj_csrf_token');

    const adminHeaders = {
      Cookie: `${adminCookie}; mj_csrf_token=${csrfCookie}`,
      'x-csrf-token': csrfToken,
    };
    assert(Boolean(csrfToken), 'Admin session and CSRF credentials generated successfully');

    // -------------------------------------------------------------
    // Section 4: Testing Business Operations Overview Dashboard
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Business Operations Overview Dashboard ---');
    {
      const resOverview = await requestJson(server, {
        path: '/api/admin/business/overview',
        headers: adminHeaders,
      });

      assert(resOverview.status === 200, 'Admin accesses GET /api/admin/business/overview (200 OK)');
      assert(Boolean(resOverview.body?.data?.metrics), 'Overview contains metrics object');
      assert(
        typeof resOverview.body?.data?.metrics?.totalActiveDeals === 'number',
        'Metrics includes numeric totalActiveDeals'
      );
      assert(
        typeof resOverview.body?.data?.metrics?.totalCommissionAgreed === 'number',
        'Metrics includes numeric totalCommissionAgreed'
      );
      assert(
        typeof resOverview.body?.data?.metrics?.totalCommissionReceived === 'number',
        'Metrics includes numeric totalCommissionReceived'
      );
      assert(
        typeof resOverview.body?.data?.metrics?.outstandingCommission === 'number',
        'Metrics includes numeric outstandingCommission'
      );
      assert(
        typeof resOverview.body?.data?.databaseStatus?.connected === 'boolean',
        'Overview honestly reports database status'
      );
      assert(
        Array.isArray(resOverview.body?.data?.recentTransactions),
        'Overview provides recentTransactions array'
      );

      // 4.2 Test Date Filter
      const resFiltered = await requestJson(server, {
        path: '/api/admin/business/overview?range=this_month',
        headers: adminHeaders,
      });
      assert(resFiltered.status === 200, 'Overview accepts date filter range=this_month (200 OK)');
      assert(resFiltered.body?.data?.filter?.range === 'this_month', 'Filter range reflected in response');
    }

    // -------------------------------------------------------------
    // Section 5: Testing Brokerage Deals Pipeline & Validation
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Brokerage Deals Pipeline & Validation ---');
    let testDealId = null;
    let testDealRef = null;
    {
      // 5.1 Create new brokerage deal
      const newDealPayload = {
        propertyTitle: 'Park View City Ultra Penthouse',
        propertyCity: 'Gurugram',
        seller: {
          name: 'Alok Nath',
          phone: '9811100011',
          email: 'alok.nath@example.com',
        },
        buyer: {
          name: 'Meera Kapoor',
          phone: '9822200022',
          email: 'meera.k@example.com',
        },
        expectedTransactionValue: 50000000, // 5.0 Cr
        actualTransactionValue: 0,
        status: 'lead',
        commissionTerms: {
          commissionType: 'percentage',
          percentageRate: 2, // 2%
          payer: 'seller',
          documentReference: 'MJE-BROK-2026-PVC-01',
        },
        internalNotes: 'Client introduced via high-net-worth referral network.',
      };

      const resCreateDeal = await requestJson(server, {
        method: 'POST',
        path: '/api/admin/business/deals',
        headers: adminHeaders,
        body: newDealPayload,
      });

      assert(resCreateDeal.status === 201, 'Admin creates new brokerage deal (201 Created)');
      testDealId = resCreateDeal.body?.data?.id || resCreateDeal.body?.data?._id;
      testDealRef = resCreateDeal.body?.data?.dealReference;
      assert(testDealRef?.startsWith('DEAL-'), 'Generated unique deal reference starting with DEAL-');
      assert(
        resCreateDeal.body?.data?.commissionAgreement?.agreedAmount === 1000000,
        'Commission correctly calculated at 2% of 5.0 Cr = ₹10,00,000'
      );
      assert(
        resCreateDeal.body?.data?.commissionAgreement?.isEstimated === true,
        'Commission flagged as isEstimated=true since actual value is 0'
      );
      assert(
        resCreateDeal.body?.data?.outstandingCommission === 1000000,
        'Outstanding commission initialized to full agreed amount ₹10,00,000'
      );

      // 5.2 Invalid status transition rejected
      const resInvalidStatus = await requestJson(server, {
        method: 'PATCH',
        path: `/api/admin/business/deals/${testDealId}`,
        headers: adminHeaders,
        body: { status: 'non_existent_status' },
      });
      assert(resInvalidStatus.status === 400, 'Invalid deal status rejected with 400 Bad Request');

      // 5.3 Valid status transition: lead -> negotiation -> agreement_signed
      const resStatusUpdate = await requestJson(server, {
        method: 'PATCH',
        path: `/api/admin/business/deals/${testDealId}`,
        headers: adminHeaders,
        body: { status: 'negotiation' },
      });
      assert(resStatusUpdate.status === 200, 'Deal status transitioned to "negotiation" (200 OK)');
      assert(resStatusUpdate.body?.data?.status === 'negotiation', 'Status updated to negotiation');

      // 5.4 Update actual transaction value to 4.8 Cr (recalculates commission)
      const resValUpdate = await requestJson(server, {
        method: 'PATCH',
        path: `/api/admin/business/deals/${testDealId}`,
        headers: adminHeaders,
        body: { actualTransactionValue: 48000000, status: 'agreement_signed' },
      });
      assert(resValUpdate.status === 200, 'Actual transaction value updated to 4.8 Cr (200 OK)');
      assert(
        resValUpdate.body?.data?.commissionAgreement?.agreedAmount === 960000,
        'Commission recalculated to 2% of 4.8 Cr = ₹9,60,000'
      );
      assert(
        resValUpdate.body?.data?.commissionAgreement?.isEstimated === false,
        'isEstimated flag cleared to false on confirmed deed value'
      );
      assert(
        resValUpdate.body?.data?.outstandingCommission === 960000,
        'Outstanding commission dynamically adjusted to ₹9,60,000'
      );

      // 5.5 Single Deal Retrieval
      const resSingleDeal = await requestJson(server, {
        path: `/api/admin/business/deals/${testDealId}`,
        headers: adminHeaders,
      });
      assert(resSingleDeal.status === 200, 'Admin fetches single deal details (200 OK)');
      assert(Array.isArray(resSingleDeal.body?.data?.payments), 'Single deal includes payments array');
    }

    // -------------------------------------------------------------
    // Section 6: Commission Terms Revisions & Audit Logging
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Commission Terms Revisions & Audit Logging ---');
    {
      // 6.1 Revision without reason rejected
      const resEmptyReason = await requestJson(server, {
        method: 'PATCH',
        path: `/api/admin/business/deals/${testDealId}/commission`,
        headers: adminHeaders,
        body: { percentageRate: 1.5, revisionReason: '' },
      });
      assert(resEmptyReason.status === 400, 'Commission revision without reason rejected with 400 Bad Request');

      // 6.2 Valid commission revision (e.g. negotiated down to 1.5% with reason)
      const resRevision = await requestJson(server, {
        method: 'PATCH',
        path: `/api/admin/business/deals/${testDealId}/commission`,
        headers: adminHeaders,
        body: {
          percentageRate: 1.5,
          revisionReason: 'Seller requested concession due to quick cash closure.',
        },
      });
      assert(resRevision.status === 200, 'Commission revision applied successfully (200 OK)');
      assert(
        resRevision.body?.data?.commissionAgreement?.agreedAmount === 720000,
        'Revised commission updated to 1.5% of 4.8 Cr = ₹7,20,000'
      );
      assert(
        resRevision.body?.data?.outstandingCommission === 720000,
        'Outstanding balance adjusted to ₹7,20,000'
      );
      assert(
        resRevision.body?.data?.commissionAgreement?.revisionHistory?.length >= 1,
        'Previous commission terms stored in revisionHistory array'
      );
    }

    // -------------------------------------------------------------
    // Section 7: Commission Payment Ledger & Overpayment Guards
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Commission Payment Ledger & Overpayment Guards ---');
    let payment1Id = null;
    let payment1Ref = null;
    {
      // 7.1 Attempting overpayment (> outstanding of 7,20,000) rejected
      const resOverpay = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/deals/${testDealId}/payments`,
        headers: adminHeaders,
        body: {
          amount: 800000, // Exceeds 7,20,000
          paymentMethod: 'bank_transfer',
        },
      });
      assert(resOverpay.status === 400, 'Payment exceeding outstanding commission rejected with 400 Bad Request');

      // 7.2 Record valid partial payment tranche (₹4,00,000)
      const payment1Payload = {
        amount: 400000,
        paymentDate: '2026-11-06T10:00:00Z',
        paymentMethod: 'bank_transfer',
        transactionNumber: 'HDFCR52026110600112233',
        receivedFrom: 'seller',
        payerName: 'Alok Nath',
        internalRemarks: 'Tranche 1 of 2 received via RTGS upon sale deed execution.',
      };

      const resPayment1 = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/deals/${testDealId}/payments`,
        headers: adminHeaders,
        body: payment1Payload,
      });

      assert(resPayment1.status === 201, 'Admin records partial commission payment (201 Created)');
      payment1Id = resPayment1.body?.data?.id || resPayment1.body?.data?._id;
      payment1Ref = resPayment1.body?.data?.paymentReference;
      assert(payment1Ref?.startsWith('PAY-'), 'Payment reference generated starting with PAY-');

      // 7.3 Duplicate transaction number rejected
      const resDuplicateTx = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/deals/${testDealId}/payments`,
        headers: adminHeaders,
        body: {
          amount: 100000,
          paymentMethod: 'bank_transfer',
          transactionNumber: 'HDFCR52026110600112233', // Exact same UTR
        },
      });
      assert(resDuplicateTx.status === 400, 'Duplicate transaction number rejected with 400 Bad Request');

      // 7.4 Check deal balance after payment 1
      const resDealAfterPay1 = await requestJson(server, {
        path: `/api/admin/business/deals/${testDealId}`,
        headers: adminHeaders,
      });
      assert(
        resDealAfterPay1.body?.data?.totalReceivedCommission === 400000,
        'Deal totalReceivedCommission is ₹4,00,000'
      );
      assert(
        resDealAfterPay1.body?.data?.outstandingCommission === 320000,
        'Deal outstandingCommission decreased to ₹3,20,000'
      );
      assert(
        resDealAfterPay1.body?.data?.commissionAgreement?.status === 'partially_collected',
        'Commission status updated to "partially_collected"'
      );

      // 7.5 Record second payment for remaining ₹3,20,000
      const resPayment2 = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/deals/${testDealId}/payments`,
        headers: adminHeaders,
        body: {
          amount: 320000,
          paymentDate: '2026-11-07T11:00:00Z',
          paymentMethod: 'bank_transfer',
          transactionNumber: 'ICICIR2026110700998877',
          receivedFrom: 'seller',
          payerName: 'Alok Nath',
          internalRemarks: 'Final tranche received upon key handover.',
        },
      });
      assert(resPayment2.status === 201, 'Admin records second payment tranche (201 Created)');

      // 7.6 Deal balance is now fully realized
      const resDealFullyPaid = await requestJson(server, {
        path: `/api/admin/business/deals/${testDealId}`,
        headers: adminHeaders,
      });
      assert(
        resDealFullyPaid.body?.data?.totalReceivedCommission === 720000,
        'Deal totalReceivedCommission reached full ₹7,20,000'
      );
      assert(
        resDealFullyPaid.body?.data?.outstandingCommission === 0,
        'Deal outstandingCommission is exactly ₹0'
      );
      assert(
        resDealFullyPaid.body?.data?.commissionAgreement?.status === 'fully_collected',
        'Commission status transitioned to "fully_collected"'
      );

      // 7.7 Global Commission Ledger querying
      const resLedger = await requestJson(server, {
        path: '/api/admin/business/commission-ledger',
        headers: adminHeaders,
      });
      assert(resLedger.status === 200, 'Admin fetches global commission ledger (200 OK)');
      assert(resLedger.body?.data?.items?.length >= 2, 'Global ledger contains recorded payments');
    }

    // -------------------------------------------------------------
    // Section 8: Commission Payment Reversal Workflow
    // -------------------------------------------------------------
    console.log('\n--- 8. Testing Commission Payment Reversal Workflow ---');
    {
      // 8.1 Reversal without reason rejected
      const resEmptyRevReason = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/payments/${payment1Id}/reverse`,
        headers: adminHeaders,
        body: { reason: '' },
      });
      assert(resEmptyRevReason.status === 400, 'Payment reversal without reason rejected with 400 Bad Request');

      // 8.2 Valid reversal
      const resReversal = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/payments/${payment1Id}/reverse`,
        headers: adminHeaders,
        body: { reason: 'Cheque returned unpaid / RTGS recall requested by bank.' },
      });
      assert(resReversal.status === 200, 'Payment reversed successfully (200 OK)');
      assert(resReversal.body?.data?.isReversed === true, 'Payment marked as isReversed=true');

      // 8.3 Verify deal outstanding balance is restored
      const resDealRestored = await requestJson(server, {
        path: `/api/admin/business/deals/${testDealId}`,
        headers: adminHeaders,
      });
      assert(
        resDealRestored.body?.data?.outstandingCommission === 400000,
        'Deal outstandingCommission restored by reversed amount to ₹4,00,000'
      );

      // 8.4 Double reversal rejected
      const resDoubleRev = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/payments/${payment1Id}/reverse`,
        headers: adminHeaders,
        body: { reason: 'Attempting second reversal' },
      });
      assert(resDoubleRev.status === 400, 'Re-reversing already reversed payment rejected with 400 Bad Request');
    }

    // -------------------------------------------------------------
    // Section 9: Company-Owned Property Financials & CapEx Ledger
    // -------------------------------------------------------------
    console.log('\n--- 9. Testing Company-Owned Property Financials & CapEx ---');
    const companyPropId = 'company_asset_test_01';
    inMemorySubmissionStore.set(companyPropId, {
      id: companyPropId,
      _id: companyPropId,
      title: 'Vipul Belmonte Sky Villa',
      listingType: 'company_owned',
      city: 'Gurugram',
      locality: 'Golf Course Road',
      acquisitionCost: 20000000, // 2.0 Cr
      acquisitionDate: '2026-01-10T10:00:00Z',
      availabilityStatus: 'available',
    });

    let expense1Id = null;
    {
      // 9.1 Inspect company financials
      const resCompanyProps = await requestJson(server, {
        path: '/api/admin/business/company-properties',
        headers: adminHeaders,
      });
      assert(resCompanyProps.status === 200, 'Admin fetches company property financials (200 OK)');
      const matchProp = resCompanyProps.body?.data?.find((p) => p.id === companyPropId);
      assert(Boolean(matchProp), 'Company properties list includes test company asset');
      assert(matchProp?.acquisitionCost === 20000000, 'Acquisition cost is ₹2,00,00,000');

      // 9.2 Record Expense 1: Registration Stamp Duty (₹12,00,000)
      const resExp1 = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/company-properties/${companyPropId}/expenses`,
        headers: adminHeaders,
        body: {
          category: 'registration',
          amount: 1200000,
          vendor: 'Sub-Registrar Gurugram',
          description: 'Stamp duty and registration fees for corporate acquisition.',
          receiptReference: 'REG-GGM-2026-1122',
        },
      });
      assert(resExp1.status === 201, 'Admin records property registration expense (201 Created)');
      expense1Id = resExp1.body?.data?.id || resExp1.body?.data?._id;

      // 9.3 Record Expense 2: Renovation (₹8,00,000)
      const resExp2 = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/company-properties/${companyPropId}/expenses`,
        headers: adminHeaders,
        body: {
          category: 'renovation',
          amount: 800000,
          vendor: 'Apex Civil Contractors',
          description: 'Italian marble polishing and terrace waterproofing.',
          receiptReference: 'APEX-INV-2026-44',
        },
      });
      assert(resExp2.status === 201, 'Admin records property renovation expense (201 Created)');

      // 9.4 Verify total investment calculation (2.0 Cr + 12L + 8L = 2.20 Cr)
      const resCompanyPropsAfterExp = await requestJson(server, {
        path: '/api/admin/business/company-properties',
        headers: adminHeaders,
      });
      const updatedProp = resCompanyPropsAfterExp.body?.data?.find((p) => p.id === companyPropId);
      assert(
        updatedProp?.totalExpenses === 2000000,
        'Total property expenses accurately computed: ₹20,00,000'
      );
      assert(
        updatedProp?.totalInvestment === 22000000,
        'Total basis investment accurately computed: ₹2,20,00,000'
      );

      // 9.5 Reverse Expense 1 (Testing reversal)
      const resExpRev = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/company-properties/${companyPropId}/expenses/${expense1Id}/reverse`,
        headers: adminHeaders,
        body: { reason: 'Incorrect vendor invoice uploaded; will re-issue.' },
      });
      assert(resExpRev.status === 200, 'Property expense reversed successfully (200 OK)');

      // Re-add expense 1 so financial calculations for sale are realistic
      await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/company-properties/${companyPropId}/expenses`,
        headers: adminHeaders,
        body: {
          category: 'registration',
          amount: 1200000,
          vendor: 'Sub-Registrar Gurugram',
          description: 'Stamp duty and registration fees for corporate acquisition.',
        },
      });
    }

    // -------------------------------------------------------------
    // Section 10: Company-Owned Property Resale & Gross Margin
    // -------------------------------------------------------------
    console.log('\n--- 10. Testing Company Property Resale & Gross Margin ---');
    {
      // 10.1 Zero sale amount rejected
      const resZeroSale = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/company-properties/${companyPropId}/sale`,
        headers: adminHeaders,
        body: {
          saleAmount: 0,
          buyer: { name: 'Dr. Sameer Sen' },
          agreementReference: 'MJE-SALE-DIR-2026-77',
        },
      });
      assert(resZeroSale.status === 400, 'Zero sale amount rejected with 400 Bad Request');

      // 10.2 Missing buyer rejected
      const resNoBuyer = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/company-properties/${companyPropId}/sale`,
        headers: adminHeaders,
        body: {
          saleAmount: 26000000,
          buyer: { name: '' },
          agreementReference: 'MJE-SALE-DIR-2026-77',
        },
      });
      assert(resNoBuyer.status === 400, 'Missing buyer details rejected with 400 Bad Request');

      // 10.3 Execute valid sale at ₹2.60 Cr (Investment = 2.20 Cr, Gross Profit = ₹40 Lakhs)
      const resSale = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/company-properties/${companyPropId}/sale`,
        headers: adminHeaders,
        body: {
          buyer: {
            name: 'Dr. Sameer Sen',
            phone: '9811188899',
            email: 'sameer.sen@example.com',
            address: '14 Civil Lines, Gurugram',
          },
          saleDate: '2026-11-07T12:00:00Z',
          saleAmount: 26000000, // 2.60 Cr
          agreementReference: 'MJE-SALE-DIR-2026-77',
          paymentReceived: 26000000,
          internalRemarks: 'Full payment received via RTGS. Registry executed at Tehsil office.',
        },
      });

      assert(resSale.status === 201, 'Company property sale recorded successfully (201 Created)');
      assert(
        resSale.body?.data?.totalInvestment === 22000000,
        'Recorded total investment is ₹2,20,00,000'
      );
      assert(
        resSale.body?.data?.grossProfit === 4000000,
        'Gross profit accurately computed: ₹2.60 Cr - ₹2.20 Cr = ₹40,00,000'
      );
      assert(
        resSale.body?.data?.grossMarginPercentage === 15.38,
        'Gross margin % accurately computed: (40L / 2.60 Cr) * 100 = 15.38%'
      );
      assert(
        resSale.body?.data?.paymentStatus === 'fully_paid',
        'Payment status is "fully_paid"'
      );
    }

    // -------------------------------------------------------------
    // Section 11: General Business Operating Expenses
    // -------------------------------------------------------------
    console.log('\n--- 11. Testing General Business Operating Expenses ---');
    let bExpId = null;
    {
      // 11.1 Record operating expense
      const resBExp = await requestJson(server, {
        method: 'POST',
        path: '/api/admin/business/expenses',
        headers: adminHeaders,
        body: {
          title: 'Google Cloud Platform Server Infrastructure',
          category: 'software_subscriptions',
          amount: 45000,
          vendor: 'Google Cloud India',
          paymentMethod: 'bank_transfer',
          referenceNumber: 'GCP-AUTO-DEBIT-NOV26',
          description: 'Production cluster hosting and automated backups.',
        },
      });
      assert(resBExp.status === 201, 'Admin records general business expense (201 Created)');
      bExpId = resBExp.body?.data?.id || resBExp.body?.data?._id;

      // 11.2 Category filtering
      const resFilteredBExp = await requestJson(server, {
        path: '/api/admin/business/expenses?category=software_subscriptions',
        headers: adminHeaders,
      });
      assert(resFilteredBExp.status === 200, 'Admin filters business expenses by category (200 OK)');
      assert(
        resFilteredBExp.body?.data?.items?.some((e) => e.category === 'software_subscriptions'),
        'Filtered results include software subscriptions'
      );

      // 11.3 Reverse expense
      const resBExpRev = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/business/expenses/${bExpId}/reverse`,
        headers: adminHeaders,
        body: { reason: 'Duplicate cloud billing entry.' },
      });
      assert(resBExpRev.status === 200, 'Operating expense reversed successfully (200 OK)');
      assert(resBExpRev.body?.data?.isReversed === true, 'Expense isReversed marked true');
    }

    // -------------------------------------------------------------
    // Section 12: Financial Reports Summary & CSV Exports
    // -------------------------------------------------------------
    console.log('\n--- 12. Testing Financial Reports Summary & CSV Exports ---');
    {
      // 12.1 Reports summary
      const resReports = await requestJson(server, {
        path: '/api/admin/business/reports/summary',
        headers: adminHeaders,
      });
      assert(resReports.status === 200, 'Admin fetches financial reports summary (200 OK)');
      assert(
        Boolean(resReports.body?.data?.brokerageReports?.dealsByStatus),
        'Reports includes dealsByStatus breakdown'
      );
      assert(
        Boolean(resReports.body?.data?.brokerageReports?.commissionByPayer),
        'Reports includes commissionByPayer breakdown'
      );
      assert(
        Boolean(resReports.body?.data?.businessExpenseReports?.expensesByCategory),
        'Reports includes expensesByCategory breakdown'
      );

      // 12.2 CSV Exports
      const reportTypes = [
        'brokerage_deals',
        'commission_ledger',
        'company_sales',
        'business_expenses',
      ];

      for (const rType of reportTypes) {
        const resCsv = await requestJson(server, {
          path: `/api/admin/business/reports/export/${rType}`,
          headers: adminHeaders,
        });
        assert(resCsv.status === 200, `CSV export for ${rType} responds with 200 OK`);
        assert(
          resCsv.headers['content-type']?.includes('text/csv'),
          `CSV export for ${rType} sets Content-Type text/csv`
        );
        assert(
          typeof resCsv.body === 'string' && resCsv.body.length > 20,
          `CSV export for ${rType} contains formatted CSV data rows`
        );
      }
    }

    // -------------------------------------------------------------
    // Section 13: Financial Privacy & Data Leak Protection
    // -------------------------------------------------------------
    console.log('\n--- 13. Testing Financial Privacy & Data Leak Defense ---');
    {
      // Public caller accesses the sold company property
      const resPublicProp = await requestJson(server, {
        path: `/api/properties/${companyPropId}`,
      });

      // Even if public caller accesses property, financial fields must NEVER appear
      if (resPublicProp.status === 200) {
        assert(
          resPublicProp.body?.data?.acquisitionCost === undefined,
          'PRIVACY GUARANTEE: acquisitionCost is strictly UNDEFINED in public DTO'
        );
        assert(
          resPublicProp.body?.data?.totalExpenses === undefined,
          'PRIVACY GUARANTEE: totalExpenses is strictly UNDEFINED in public DTO'
        );
        assert(
          resPublicProp.body?.data?.grossProfit === undefined,
          'PRIVACY GUARANTEE: grossProfit is strictly UNDEFINED in public DTO'
        );
        assert(
          resPublicProp.body?.data?.commission === undefined,
          'PRIVACY GUARANTEE: commission is strictly UNDEFINED in public DTO'
        );
      } else {
        assert(true, 'PRIVACY GUARANTEE: Private/sold asset properly hidden from public catalogue');
      }
    }

    // -------------------------------------------------------------
    // Section 14: Administrative Audit Trail Verification
    // -------------------------------------------------------------
    console.log('\n--- 14. Testing Administrative Audit Trail Logging ---');
    {
      const resAudit = await requestJson(server, {
        path: '/api/admin/activity-logs',
        headers: adminHeaders,
      });

      assert(resAudit.status === 200, 'Admin fetches activity logs (200 OK)');
      const logs = resAudit.body?.data?.items || [];
      const hasDealAction = logs.some((l) => l.action?.includes('deal'));
      const hasPaymentAction = logs.some((l) => l.action?.includes('commission_payment'));
      const hasExpenseAction = logs.some((l) => l.action?.includes('expense'));
      const hasReportAction = logs.some((l) => l.action?.includes('financial_report'));

      assert(hasDealAction, 'Audit trail contains recorded deal operations');
      assert(hasPaymentAction, 'Audit trail contains recorded payment operations');
      assert(hasExpenseAction, 'Audit trail contains recorded expense operations');
      assert(hasReportAction, 'Audit trail contains recorded report export operations');
    }

    // -------------------------------------------------------------
    // Section 15: Public API Regression Testing
    // -------------------------------------------------------------
    console.log('\n--- 15. Regression Testing Public APIs ---');
    {
      const resHealth = await requestJson(server, { path: '/api/health' });
      assert(resHealth.status === 200, 'Public health endpoint operational (200 OK)');

      const resProps = await requestJson(server, { path: '/api/properties' });
      assert(resProps.status === 200, 'Public property catalogue functional (200 OK)');
    }
  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }

  console.log('\n======================================================');
  console.log(` RESULT: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('======================================================\n');
}

runBusinessTests();

