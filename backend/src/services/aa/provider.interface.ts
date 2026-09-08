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
  type NormalizedTransaction
} from './types.js';

export interface IAAProvider {
  /**
   * Returns the unique provider identifier (e.g., 'mock', 'setu', 'finvu', 'onemoney').
   */
  getProviderId(): AAProviderType;

  /**
   * Initializes or creates a consent artifact/handle with the AA ecosystem.
   */
  createConsent(params: CreateConsentParams): Promise<ConsentResult>;

  /**
   * Retrieves the current consent verification status from the AA ecosystem.
   */
  getConsentStatus(consentId: string): Promise<ConsentStatusResult>;

  /**
   * Revokes an active consent artifact with the AA provider.
   */
  revokeConsent(consentId: string): Promise<RevokeConsentResult>;

  /**
   * Discovers bank / FIP accounts linked to the user's identifier under authorized consent.
   */
  discoverAccounts(userId: number, institutionName?: string): Promise<DiscoveredAccount[]>;

  /**
   * Initiates an asynchronous financial data fetch session with FIPs via the AA ecosystem.
   */
  requestFinancialData(params: RequestDataParams): Promise<DataSessionResult>;

  /**
   * Polls or checks whether the requested financial data session is ready for download/decryption.
   */
  checkDataReady(consentId: string, sessionId: string): Promise<DataReadyResult>;

  /**
   * Fetches raw financial information for an authorized account once data is ready.
   */
  fetchFinancialData(params: FetchDataParams): Promise<RawFinancialData>;

  /**
   * Normalizes vendor-specific financial transactions into Spend Analysis standard format.
   */
  normalizeFinancialData(raw: RawFinancialData): NormalizedTransaction[];
}
