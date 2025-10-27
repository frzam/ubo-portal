import { NextRequest } from 'next/server';

export type CustomerKey = '1001' | '1002' | '1003' | '1004' | '1005';

export function getCustomerKey(req: NextRequest): CustomerKey {
  const url = new URL(req.url);
  const cif = url.searchParams.get('cif') || '';
  const id = url.searchParams.get('id_number') || '';
  const val = (cif || id || '').trim();
  const allowed: CustomerKey[] = ['1001', '1002', '1003', '1004', '1005'];
  if ((allowed as string[]).includes(val)) return val as CustomerKey;
  // Default to 1001 if not provided or unsupported
  return '1001';
}

export function getIdentity(req: NextRequest) {
  const url = new URL(req.url);
  const cif = url.searchParams.get('cif') || '';
  const id_number = url.searchParams.get('id_number') || '';
  return { cif, id_number };
}

// Produce deterministic dummy data for a given key
export function makeCustomerData(key: CustomerKey, identity?: { cif?: string; id_number?: string }) {
  const idx = parseInt(key.slice(-1), 10); // 1..5
  const namePool = ['Ahmed Al Saud', 'Fatimah Al Harbi', 'Omar Al Qahtani', 'Reem Al Anazi', 'Yasir Al Mutairi'];
  const segPool = ['HNI', 'Retail', 'Priority', 'Private', 'Corporate'];
  const rmPool = ['Layla', 'Mansour', 'Nada', 'Faisal', 'Huda'];
  const riskPool = ['Low', 'Moderate', 'High', 'Moderate', 'Low'];
  const customer_name = namePool[idx - 1];
  const segment = segPool[idx - 1];
  const rm_name = rmPool[idx - 1] + ' RM';
  const risk_rating = riskPool[idx - 1];

  const cif = identity?.cif?.trim() || `10${key}999`;
  // Generate a default ID if not provided: odd keys start with '1' (Saudi), even with '2' (Non-Saudi)
  const generatedId = `${idx % 2 === 1 ? '1' : '2'}${key}888`;
  const id_number = (identity?.id_number ?? '').trim() || generatedId;

  // Profile
  // Nationality derives from the actual id_number string we expose
  const nationality = id_number.startsWith('1') ? 'Saudi' : 'Non-Saudi';
  const profile = {
    customer_name,
    cif,
    id_number,
    dob: `198${idx}-0${idx}-1${idx}`,
    nationality,
    segment,
    rm_name,
    risk_rating,
  };

  // KYC
  const kyc_status = [
    { status_type: 'KYC Complete', count: 1 },
    { status_type: 'AML Screening', count: idx % 2 === 0 ? 2 : 1 },
    { status_type: 'FATCA', count: 1 },
    { status_type: 'CRS', count: idx % 3 === 0 ? 2 : 1 },
  ];

  // Asset distribution
  // Per-customer allocation profiles (weights sum to 1)
  const profiles: Record<CustomerKey, { mf: number; eq: number; fi: number; dep: number; cash: number }> = {
    '1001': { mf: 0.45, eq: 0.25, fi: 0.20, dep: 0.08, cash: 0.02 }, // all distinct
    '1002': { mf: 0.20, eq: 0.50, fi: 0.15, dep: 0.10, cash: 0.05 }, // all distinct
    '1003': { mf: 0.15, eq: 0.20, fi: 0.25, dep: 0.30, cash: 0.10 }, // all distinct
    '1004': { mf: 0.26, eq: 0.14, fi: 0.35, dep: 0.15, cash: 0.10 }, // adjusted to avoid equal classes
    '1005': { mf: 0.31, eq: 0.29, fi: 0.11, dep: 0.10, cash: 0.19 }, // adjusted to avoid equal classes
  };
  const profileW = profiles[key];
  const totalAum = 600000 + idx * 120000; // Different base by customer
  const amt = {
    mf: Math.round(totalAum * profileW.mf),
    eq: Math.round(totalAum * profileW.eq),
    fi: Math.round(totalAum * profileW.fi),
    dep: Math.round(totalAum * profileW.dep),
    cash: Math.max(1, totalAum - (Math.round(totalAum * profileW.mf) + Math.round(totalAum * profileW.eq) + Math.round(totalAum * profileW.fi) + Math.round(totalAum * profileW.dep))),
  };
  const assets_distribution = [
    { product: 'Mutual Funds', asset_value: amt.mf },
    { product: 'Equities', asset_value: amt.eq },
    { product: 'Fixed Income', asset_value: amt.fi },
    { product: 'Deposits', asset_value: amt.dep },
    // Cash isn't in the donut on the left in current UI; keep to summary
  ];

  // Asset trend over 12 months
  const today = new Date();
  const asset_trend = [...Array(12)].map((_, i) => {
    const d = new Date(today);
    d.setMonth(today.getMonth() - (11 - i));
    const base = 600000 + idx * 80000;
    return { date: d.toISOString().slice(0, 10), asset_value: base + i * (15000 + idx * 1000) + (i % 2 ? 3000 * idx : -2000 * idx) };
  });

  // Holdings (kept simple, values roughly aligned with allocation)
  const holdings = [
    { productType: 'Mutual Fund', accountNumber: `MF-${key}01`, currency: 'SAR', currentValue: Math.round(amt.mf * 0.9), lastTxnDate: '2025-10-15', status: 'Active' },
    { productType: 'Equity', accountNumber: `EQ-${key}02`, currency: 'SAR', currentValue: Math.round(amt.eq * 0.9), lastTxnDate: '2025-10-10', status: 'Active' },
    { productType: 'Fixed Income', accountNumber: `FI-${key}03`, currency: 'USD', currentValue: Math.round(amt.fi * 0.9), lastTxnDate: '2025-09-30', status: 'Active' },
    { productType: 'Deposit', accountNumber: `DP-${key}04`, currency: 'SAR', currentValue: Math.round(amt.dep * 0.9), lastTxnDate: '2025-10-01', status: idx % 2 ? 'Maturing' : 'Active' },
  ];

  // Transactions summary
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const transactions_summary = [...Array(6)].map((_, i) => {
    const d = new Date(now);
    d.setMonth(now.getMonth() - (5 - i));
    const month = months[d.getMonth()];
    return { month, inflows: 50000 + idx * 5000 + i * 3000, outflows: 35000 + idx * 4000 + i * 2500 };
  });

  // Risk exposure
  const risk_exposure = [
    { asset_class: 'Equities', exposure_score: 40 + idx * 5 },
    { asset_class: 'Fixed Income', exposure_score: 30 + idx * 4 },
    { asset_class: 'Alternatives', exposure_score: 15 + idx * 3 },
    { asset_class: 'Real Estate', exposure_score: 20 + idx * 2 },
    { asset_class: 'Cash', exposure_score: 10 + idx * 2 },
  ];

  // Liabilities
  const liabilities = [
    { facility_type: 'Margin Loan', outstanding_amount: 50000 + idx * 15000 },
    { facility_type: 'Overdraft', outstanding_amount: 20000 + idx * 5000 },
  ];

  // Alerts
  const alerts = [
    { date: '2025-10-10', eventType: 'KYC Review Due', description: `KYC review pending for profile ${key}`, severity: idx % 2 ? 'Medium' : 'Low', actionTaken: 'Reminder sent' },
    { date: '2025-10-14', eventType: 'Large Outflow', description: `Outflow exceeding threshold (${key})`, severity: 'High', actionTaken: 'Reviewed' },
  ];

  // Interactions
  const interactions = [
    { ts: '2025-10-12T09:30:00Z', type: 'RM Meeting', note: `Quarterly review for ${customer_name}` },
    { ts: '2025-10-15T14:10:00Z', type: 'Service Request', note: 'Address update' },
    { ts: '2025-10-18T11:00:00Z', type: 'Call', note: 'Discussed new fund subscription' },
  ];

  // Data quality
  const data_quality = { data_completeness: 'Profile', score: 80 + idx };

  // Assets summary (table + pie input, this drives Allocation by Asset Class chart)
  const assets_summary = [
    {
      customerId: `CUST-${key}`,
      customerName: customer_name,
      assetId: `AST-${key}01`,
      assetType: 'Mutual Fund',
      productName: 'SNB Balanced Fund',
      isinCode: 'SA1234567890',
      accountNumber: `001-${key}001`,
      custodianName: 'SNB Capital',
      unitsHeld: 1000 + idx * 50,
      pricePerUnit: 12.5 + idx,
      marketValue: amt.mf,
      bookValue: Math.round(amt.mf * 0.95),
      unrealizedGainLoss: 500 + idx * 200,
      currency: 'SAR',
      valuationDate: '2025-10-25',
      lastTransactionDate: '2025-09-15',
      riskCategory: 'Moderate',
      liquidityStatus: 'Liquid',
      incomeGeneratedYTD: 400 + idx * 50,
      assetStatus: 'Active',
      sourceSystem: 'PMS',
      lastUpdatedBy: 'AutoJob_PMSFeed',
      lastUpdatedAt: '2025-10-25 10:15:00',
    },
    {
      customerId: `CUST-${key}`,
      customerName: customer_name,
      assetId: `AST-${key}02`,
      assetType: 'Equity',
      productName: 'ARAMCO',
      isinCode: 'SA0000001234',
      accountNumber: `001-${key}002`,
      custodianName: 'HSBC Custody',
      unitsHeld: 200 + idx * 10,
      pricePerUnit: 30 + idx * 0.5,
      marketValue: amt.eq,
      bookValue: Math.round(amt.eq * 0.93),
      unrealizedGainLoss: 500 + idx * 200,
      currency: 'SAR',
      valuationDate: '2025-10-25',
      lastTransactionDate: '2025-09-12',
      riskCategory: 'High',
      liquidityStatus: 'Liquid',
      incomeGeneratedYTD: 120 + idx * 20,
      assetStatus: 'Active',
      sourceSystem: 'Custodian',
      lastUpdatedBy: 'AutoJob_CustFeed',
      lastUpdatedAt: '2025-10-25 10:15:00',
    },
    {
      customerId: `CUST-${key}`,
      customerName: customer_name,
      assetId: `AST-${key}03`,
      assetType: 'Sukuk',
      productName: 'Saudi Gov 2030',
      isinCode: 'SA0002030SUK',
      accountNumber: `001-${key}003`,
      custodianName: 'SNB Custody',
      unitsHeld: 8 + idx,
      pricePerUnit: 1000 + idx * 20,
      marketValue: amt.fi,
      bookValue: Math.round(amt.fi * 0.97),
      unrealizedGainLoss: 200 + idx * 200,
      currency: 'SAR',
      valuationDate: '2025-10-25',
      lastTransactionDate: '2025-09-10',
      riskCategory: 'Low',
      liquidityStatus: 'Liquid',
      incomeGeneratedYTD: 320 + idx * 40,
      assetStatus: 'Active',
      sourceSystem: 'Custodian',
      lastUpdatedBy: 'AutoJob_CustFeed',
      lastUpdatedAt: '2025-10-25 10:15:00',
    },
    {
      customerId: `CUST-${key}`,
      customerName: customer_name,
      assetId: `AST-${key}04`,
      assetType: 'Deposit',
      productName: '1 Year Term',
      isinCode: null,
      accountNumber: `001-${key}004`,
      custodianName: 'SNB CoreBanking',
      unitsHeld: null,
      pricePerUnit: null,
      marketValue: amt.dep,
      bookValue: amt.dep,
      unrealizedGainLoss: 0,
      currency: 'SAR',
      valuationDate: '2025-10-25',
      lastTransactionDate: '2025-09-01',
      riskCategory: 'Low',
      liquidityStatus: idx % 2 ? 'Lock-in' : 'Liquid',
      incomeGeneratedYTD: 0,
      assetStatus: 'Active',
      sourceSystem: 'CoreBanking',
      lastUpdatedBy: 'AutoJob_CoreFeed',
      lastUpdatedAt: '2025-10-25 10:15:00',
    },
    {
      customerId: `CUST-${key}`,
      customerName: customer_name,
      assetId: `AST-${key}05`,
      assetType: 'Cash',
      productName: 'Settlement A/C',
      isinCode: null,
      accountNumber: `001-${key}005`,
      custodianName: 'SNB CoreBanking',
      unitsHeld: null,
      pricePerUnit: null,
      marketValue: amt.cash,
      bookValue: amt.cash,
      unrealizedGainLoss: 0,
      currency: 'SAR',
      valuationDate: '2025-10-25',
      lastTransactionDate: '2025-09-20',
      riskCategory: 'Low',
      liquidityStatus: 'Liquid',
      incomeGeneratedYTD: 0,
      assetStatus: 'Active',
      sourceSystem: 'CoreBanking',
      lastUpdatedBy: 'AutoJob_CoreFeed',
      lastUpdatedAt: '2025-10-25 10:15:00',
    },
  ];

  return {
    profile,
    kyc_status,
    assets_distribution,
    asset_trend,
    holdings,
    transactions_summary,
    risk_exposure,
    liabilities,
    alerts,
    interactions,
    data_quality,
    assets_summary,
  };
}
