import { type IAAProvider } from './provider.interface.js';
import { type AAProviderType } from './types.js';
import { MockAAProvider } from './mock.provider.js';

export interface ProviderInfo {
  id: AAProviderType;
  displayName: string;
  isAvailable: boolean;
  isSandbox: boolean;
  description: string;
}

export class AAProviderRegistry {
  private static providers: Map<AAProviderType, IAAProvider> = new Map();
  private static activeProviderType: AAProviderType = 'mock';

  static {
    // Register default mock provider
    this.registerProvider(new MockAAProvider());

    // Configure active provider from environment variable
    const envProvider = (process.env.AA_PROVIDER || 'mock').toLowerCase() as AAProviderType;
    if (this.providers.has(envProvider)) {
      this.activeProviderType = envProvider;
    } else {
      this.activeProviderType = 'mock';
    }
  }

  /**
   * Registers a provider instance.
   */
  public static registerProvider(provider: IAAProvider): void {
    this.providers.set(provider.getProviderId(), provider);
  }

  /**
   * Retrieves a specific provider by type or returns the default active provider.
   */
  public static getProvider(type?: AAProviderType): IAAProvider {
    const targetType = type || this.activeProviderType;
    const provider = this.providers.get(targetType);

    if (!provider) {
      // Fallback safely to mock provider
      const fallback = this.providers.get('mock');
      if (fallback) return fallback;
      throw new Error(`Account Aggregator provider '${targetType}' is not registered.`);
    }

    return provider;
  }

  /**
   * Returns the currently configured active provider.
   */
  public static getActiveProvider(): IAAProvider {
    return this.getProvider(this.activeProviderType);
  }

  /**
   * Sets the active provider at runtime (e.g. for testing or dynamic switching).
   */
  public static setActiveProvider(type: AAProviderType): void {
    if (!this.providers.has(type)) {
      throw new Error(`Cannot set active provider: '${type}' is not registered.`);
    }
    this.activeProviderType = type;
  }

  /**
   * Lists all supported provider options and their readiness status.
   */
  public static listSupportedProviders(): ProviderInfo[] {
    return [
      {
        id: 'mock',
        displayName: 'Mock Sandbox AA',
        isAvailable: true,
        isSandbox: true,
        description: 'Deterministic Account Aggregator sandbox simulation for testing and demo.'
      },
      {
        id: 'setu',
        displayName: 'Setu (Pine Labs) AA',
        isAvailable: Boolean(process.env.SETU_CLIENT_ID && process.env.SETU_CLIENT_SECRET),
        isSandbox: process.env.SETU_ENV !== 'production',
        description: 'Setu Account Aggregator FIU platform gateway.'
      },
      {
        id: 'finvu',
        displayName: 'Finvu (Cookiejar) AA',
        isAvailable: Boolean(process.env.FINVU_CLIENT_ID && process.env.FINVU_CLIENT_SECRET),
        isSandbox: process.env.FINVU_ENV !== 'production',
        description: 'Finvu RBI-regulated Account Aggregator.'
      },
      {
        id: 'onemoney',
        displayName: 'OneMoney AA',
        isAvailable: Boolean(process.env.ONEMONEY_CLIENT_ID && process.env.ONEMONEY_CLIENT_SECRET),
        isSandbox: process.env.ONEMONEY_ENV !== 'production',
        description: 'OneMoney RBI-regulated Account Aggregator.'
      },
      {
        id: 'rebit_direct',
        displayName: 'ReBIT Direct FIU Protocol',
        isAvailable: Boolean(process.env.REBIT_FIU_ID && process.env.REBIT_PRIVATE_KEY),
        isSandbox: process.env.REBIT_ENV !== 'production',
        description: 'Direct RBI/ReBIT asymmetric encryption FIU integration protocol.'
      }
    ];
  }
}
