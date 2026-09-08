import {
  type PaymentSource,
  type Category,
  type TransactionType,
  type AccountType
} from '../../types/index.js';

export type ConsentStatus = 'PENDING' | 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'REJECTED' | 'PAUSED';

export type DataSessionStatus = 'PENDING' | 'READY' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

export type SyncStatus = 'IDLE' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'REVOKED' | 'EXPIRED';

export type AAProviderType = 'mock' | 'setu' | 'onemoney' | 'finvu' | 'anumati' | 'saafe' | 'rebit_direct';

export interface CreateConsentParams {
  userId: number;
  institutionName: string;
  accountType?: AccountType;
  durationDays?: number;
  purposeCode?: string;
}

export interface ConsentResult {
  consentId: string;
  provider: AAProviderType;
  institutionName: string;
  accountNumberMasked: string;
  accountType: AccountType;
  consentGranted: number; // 1 = active, 0 = revoked/inactive
  status: ConsentStatus;
  consentExpiry: string; // ISO / DB string format
  createdAt: string;
  consentHandleUrl?: string; // Redirect or webview URL for real AA user journey
}

export interface ConsentStatusResult {
  consentId: string;
  provider: AAProviderType;
  status: ConsentStatus;
  consentGranted: number;
  consentExpiry: string;
  revokedAt?: string;
}

export interface RevokeConsentResult {
  consentId: string;
  provider: AAProviderType;
  status: 'REVOKED';
  consentGranted: 0;
  revokedAt: string;
}

export interface DiscoveredAccount {
  accountNumberMasked: string;
  institutionName: string;
  accountType: AccountType;
  fipId?: string;
  fipName?: string;
  linkedRefNumber?: string;
}

export interface RequestDataParams {
  consentId: string;
  accountMeta: AccountMetadata;
  startDate?: string;
  endDate?: string;
}

export interface DataSessionResult {
  sessionId: string;
  consentId: string;
  status: DataSessionStatus;
  requestedAt: string;
  expiryAt?: string;
  error?: string;
}

export interface DataReadyResult {
  sessionId: string;
  consentId: string;
  status: DataSessionStatus;
  isReady: boolean;
  readyAt?: string;
}

export interface FetchDataParams {
  consentId: string;
  sessionId?: string;
  accountMeta: AccountMetadata;
}

export interface RawFinancialTransaction {
  txnId?: string;
  date: string;
  narration: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT' | 'Debit' | 'Credit';
  mode?: string; // UPI, CARD, NEFT, IMPS, RTGS, etc.
  reference?: string;
  rawCategory?: string;
}

export interface RawFinancialData {
  consentId: string;
  sessionId?: string;
  accountNumberMasked: string;
  institutionName: string;
  accountType: AccountType;
  transactions: RawFinancialTransaction[];
  fetchedAt: string;
}

export interface NormalizedTransaction {
  external_transaction_id?: string;
  transaction_date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  merchant: string;
  payment_source: PaymentSource;
  category: Category;
}

export interface IngestionResult {
  totalProcessed: number;
  insertedCount: number;
  skippedDuplicates: number;
  transactions: NormalizedTransaction[];
}

export interface AccountMetadata {
  accountId: number;
  userId: number;
  institutionName: string;
  accountNumberMasked: string;
}
