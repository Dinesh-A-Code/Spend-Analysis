import {
  type IAAProvider
} from './provider.interface.js';
import {
  type AAProviderType,
  type CreateConsentParams,
  type ConsentResult,
  type ConsentStatusResult,
  type RevokeConsentResult,
  type DiscoveredAccount,
  type RequestDataParams,
  type DataSessionResult,
  type DataReadyResult,
  type FetchDataParams,
  type RawFinancialData,
  type RawFinancialTransaction,
  type NormalizedTransaction
} from './types.js';
import { type AccountType, type PaymentSource, type TransactionType } from '../../types/index.js';
import { CategorizationService } from '../categorization.service.js';

export const MOCK_SUPPORTED_INSTITUTIONS: { name: string; maskedNumber: string; type: AccountType }[] = [
  { name: 'HDFC Bank', maskedNumber: 'XXXX-XXXX-9876', type: 'Savings' },
  { name: 'ICICI Bank', maskedNumber: 'XXXX-XXXX-4512', type: 'Savings' },
  { name: 'State Bank of India (SBI)', maskedNumber: 'XXXX-XXXX-3341', type: 'Savings' },
  { name: 'Axis Bank', maskedNumber: 'XXXX-XXXX-6623', type: 'Savings' }
];

export class MockAAProvider implements IAAProvider {
  public getProviderId(): AAProviderType {
    return 'mock';
  }

  public async createConsent(params: CreateConsentParams): Promise<ConsentResult> {
    const institution = MOCK_SUPPORTED_INSTITUTIONS.find(
      inst => inst.name.toLowerCase().includes(params.institutionName.trim().toLowerCase()) ||
              params.institutionName.toLowerCase().includes(inst.name.toLowerCase())
    ) || {
      name: params.institutionName.trim() || 'HDFC Bank',
      maskedNumber: 'XXXX-XXXX-8899',
      type: (params.accountType || 'Savings') as AccountType
    };

    const consentId = `CNS-MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const durationDays = params.durationDays || 365;
    const expiryDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    const consentExpiry = expiryDate.toISOString().replace('T', ' ').substring(0, 19);
    const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    return {
      consentId,
      provider: 'mock',
      institutionName: `${institution.name} (Mock)`,
      accountNumberMasked: institution.maskedNumber,
      accountType: institution.type,
      consentGranted: 1,
      status: 'ACTIVE',
      consentExpiry,
      createdAt
    };
  }

  public async getConsentStatus(consentId: string): Promise<ConsentStatusResult> {
    return {
      consentId,
      provider: 'mock',
      status: 'ACTIVE',
      consentGranted: 1,
      consentExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  public async revokeConsent(consentId: string): Promise<RevokeConsentResult> {
    return {
      consentId,
      provider: 'mock',
      status: 'REVOKED',
      consentGranted: 0,
      revokedAt: new Date().toISOString()
    };
  }

  public async discoverAccounts(_userId: number, institutionName: string = 'HDFC Bank'): Promise<DiscoveredAccount[]> {
    const matched = MOCK_SUPPORTED_INSTITUTIONS.filter(inst =>
      !institutionName || inst.name.toLowerCase().includes(institutionName.toLowerCase())
    );

    if (matched.length > 0) {
      return matched.map(m => ({
        accountNumberMasked: m.maskedNumber,
        institutionName: `${m.name} (Mock)`,
        accountType: m.type,
        fipId: `FIP-${m.name.toUpperCase().replace(/\s+/g, '-')}`,
        fipName: m.name
      }));
    }

    return [{
      accountNumberMasked: 'XXXX-XXXX-9876',
      institutionName: `${institutionName} (Mock)`,
      accountType: 'Savings',
      fipId: 'FIP-MOCK',
      fipName: institutionName
    }];
  }

  public async requestFinancialData(params: RequestDataParams): Promise<DataSessionResult> {
    const sessionId = `SESSION-MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return {
      sessionId,
      consentId: params.consentId,
      status: 'READY',
      requestedAt: new Date().toISOString()
    };
  }

  public async checkDataReady(consentId: string, sessionId: string): Promise<DataReadyResult> {
    return {
      sessionId,
      consentId,
      status: 'READY',
      isReady: true,
      readyAt: new Date().toISOString()
    };
  }

  public async fetchFinancialData(params: FetchDataParams): Promise<RawFinancialData> {
    const rawTransactions: RawFinancialTransaction[] = [
      // Income Transaction (August 2026 Salary)
      { txnId: 'MOCK-TXN-001', date: '2026-08-01', narration: 'Monthly Salary Credit', amount: 45000.00, type: 'Credit', mode: 'NEFT', reference: 'Employer Inc' },
      // Daily Transactions: 2026-08-31 (Total = ₹1,240)
      { txnId: 'MOCK-TXN-002', date: '2026-08-31', narration: 'UPI/Swiggy Delivery', amount: 320.00, type: 'Debit', mode: 'UPI-GPAY', reference: 'Swiggy' },
      { txnId: 'MOCK-TXN-003', date: '2026-08-31', narration: 'UPI/City Bus Ride', amount: 80.00, type: 'Debit', mode: 'UPI-GPAY', reference: 'City Bus' },
      { txnId: 'MOCK-TXN-004', date: '2026-08-31', narration: 'UPI/Tea Shop payment', amount: 20.00, type: 'Debit', mode: 'UPI-GPAY', reference: 'Local Tea Shop' },
      { txnId: 'MOCK-TXN-005', date: '2026-08-31', narration: 'UPI/Amazon Store', amount: 100.00, type: 'Debit', mode: 'UPI-GPAY', reference: 'Amazon' },
      { txnId: 'MOCK-TXN-006', date: '2026-08-31', narration: 'UPI/Ola Cab fare', amount: 430.00, type: 'Debit', mode: 'UPI-PHONEPE', reference: 'Ola Cabs' },
      { txnId: 'MOCK-TXN-007', date: '2026-08-31', narration: 'UPI/Groceries payment', amount: 290.00, type: 'Debit', mode: 'UPI-PAYTM', reference: 'Local Grocer' },
      // Monthly Balancing Transactions (August 2026)
      { txnId: 'MOCK-TXN-008', date: '2026-08-05', narration: 'Zomato order', amount: 1870.00, type: 'Debit', mode: 'UPI-GPAY', reference: 'Zomato' },
      { txnId: 'MOCK-TXN-009', date: '2026-08-12', narration: 'Weekly Groceries', amount: 2000.00, type: 'Debit', mode: 'UPI-PHONEPE', reference: 'Star Bazaar' },
      { txnId: 'MOCK-TXN-010', date: '2026-08-15', narration: 'Myntra shopping', amount: 1800.00, type: 'Debit', mode: 'UPI-PHONEPE', reference: 'Myntra' },
      { txnId: 'MOCK-TXN-011', date: '2026-08-20', narration: 'Amazon India apparel', amount: 1300.00, type: 'Debit', mode: 'UPI-GPAY', reference: 'Amazon' },
      { txnId: 'MOCK-TXN-012', date: '2026-08-18', narration: 'Uber trip summary', amount: 1290.00, type: 'Debit', mode: 'UPI-GPAY', reference: 'Uber' },
      { txnId: 'MOCK-TXN-013', date: '2026-08-03', narration: 'Movie tickets', amount: 1200.00, type: 'Debit', mode: 'UPI-PAYTM', reference: 'BookMyShow' },
      { txnId: 'MOCK-TXN-014', date: '2026-08-02', narration: 'Electricity Bill BESCOM', amount: 2000.00, type: 'Debit', mode: 'NETBANKING', reference: 'BESCOM' },
      // Historical Trends Transactions (January - April 2026)
      { txnId: 'MOCK-TXN-015', date: '2026-01-15', narration: 'Rent & Utility bills', amount: 15000.00, type: 'Debit', mode: 'NEFT', reference: 'Society Admin' },
      { txnId: 'MOCK-TXN-016', date: '2026-02-14', narration: 'Tech purchase & medical care', amount: 17500.00, type: 'Debit', mode: 'UPI-PHONEPE', reference: 'Electronics shop' },
      { txnId: 'MOCK-TXN-017', date: '2026-03-10', narration: 'Investments & Insurance premiums', amount: 14200.00, type: 'Debit', mode: 'NETBANKING', reference: 'Zerodha' },
      { txnId: 'MOCK-TXN-018', date: '2026-04-20', narration: 'Family travel expenses', amount: 19100.00, type: 'Debit', mode: 'UPI-GPAY', reference: 'MakeMyTrip' }
    ];

    return {
      consentId: params.consentId,
      sessionId: params.sessionId,
      accountNumberMasked: params.accountMeta.accountNumberMasked,
      institutionName: params.accountMeta.institutionName,
      accountType: 'Savings',
      transactions: rawTransactions,
      fetchedAt: new Date().toISOString()
    };
  }

  public normalizeFinancialData(raw: RawFinancialData): NormalizedTransaction[] {
    return raw.transactions.map(rawTx => {
      // 1. Merchant Extraction
      const merchant = rawTx.reference || rawTx.narration.split('/')[1] || rawTx.narration;

      // 2. Deterministic Payment Source Extraction (Strict: Never guess)
      let paymentSource: PaymentSource = 'Unknown/Other';
      const mode = (rawTx.mode || '').toUpperCase();
      const narration = (rawTx.narration || '').toUpperCase();

      if (mode.includes('GPAY') || mode.includes('GOOGLEPAY') || narration.includes('GPAY') || narration.includes('GOOGLE PAY')) {
        paymentSource = 'Google Pay';
      } else if (mode.includes('PHONEPE') || narration.includes('PHONEPE')) {
        paymentSource = 'PhonePe';
      } else if (mode.includes('PAYTM') || narration.includes('PAYTM')) {
        paymentSource = 'Paytm';
      }

      // 3. Category Normalization
      const category = CategorizationService.categorize(merchant, rawTx.narration);

      // 4. Type Normalization
      const type: TransactionType = (rawTx.type.toUpperCase() === 'CREDIT') ? 'Credit' : 'Debit';

      return {
        external_transaction_id: rawTx.txnId,
        transaction_date: rawTx.date,
        description: rawTx.narration,
        amount: Number(rawTx.amount),
        type,
        merchant,
        payment_source: paymentSource,
        category
      };
    });
  }
}
