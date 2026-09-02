import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { api } from '../services/api.js';
import type { User, ConnectedAccount } from '../types/index.js';

interface OnboardingTempState {
  fullName: string;
  monthlyIncome: string;
  savingsTarget: string;
  selectedPreferences: string[];
  selectedInstitution: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  accounts: ConnectedAccount[];
  hasConnectedAccount: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingState: OnboardingTempState;
  setOnboardingState: Dispatch<SetStateAction<OnboardingTempState>>;
  login: (params: { email: string; password: string }) => Promise<ConnectedAccount[]>;
  signup: (params: {
    name: string;
    email: string;
    password: string;
    monthly_income?: number;
    savings_target?: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (params: {
    name?: string;
    monthly_income?: number;
    savings_target?: number;
  }) => Promise<void>;
  refreshAccounts: () => Promise<void>;
  connectAccount: (institutionName: string) => Promise<ConnectedAccount>;
}

const defaultOnboardingState: OnboardingTempState = {
  fullName: '',
  monthlyIncome: '',
  savingsTarget: '',
  selectedPreferences: ['Save more'],
  selectedInstitution: 'ICICI Bank',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => api.getToken());
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [onboardingState, setOnboardingState] = useState<OnboardingTempState>(defaultOnboardingState);

  const refreshAccounts = useCallback(async () => {
    if (!api.getToken()) {
      setAccounts([]);
      return;
    }
    try {
      const response = await api.getAccounts();
      setAccounts(response.accounts || []);
    } catch {
      setAccounts([]);
    }
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const currentToken = api.getToken();
    if (!currentToken) {
      setUser(null);
      setAccounts([]);
      setIsLoading(false);
      return;
    }

    try {
      const { user: profile } = await api.getMe();
      setUser(profile);
      setOnboardingState((prev) => ({
        ...prev,
        fullName: profile.name || prev.fullName,
        monthlyIncome: profile.monthly_income ? String(profile.monthly_income) : prev.monthlyIncome,
        savingsTarget: profile.savings_target ? String(profile.savings_target) : prev.savingsTarget,
      }));
      await refreshAccounts();
    } catch {
      api.setToken(null);
      setToken(null);
      setUser(null);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [refreshAccounts]);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (params: { email: string; password: string }): Promise<ConnectedAccount[]> => {
    setIsLoading(true);
    try {
      const result = await api.login(params);
      setUser(result.user);
      setToken(result.token);
      setOnboardingState((prev) => ({
        ...prev,
        fullName: result.user.name || prev.fullName,
        monthlyIncome: result.user.monthly_income ? String(result.user.monthly_income) : '',
        savingsTarget: result.user.savings_target ? String(result.user.savings_target) : '',
      }));
      const accountsRes = await api.getAccounts();
      const userAccounts = accountsRes.accounts || [];
      setAccounts(userAccounts);
      return userAccounts;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (params: {
    name: string;
    email: string;
    password: string;
    monthly_income?: number;
    savings_target?: number;
  }): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await api.signup(params);
      setUser(result.user);
      setToken(result.token);
      setOnboardingState((prev) => ({
        ...prev,
        fullName: result.user.name,
      }));
      await refreshAccounts();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await api.logout();
    } finally {
      setUser(null);
      setToken(null);
      setAccounts([]);
      setOnboardingState(defaultOnboardingState);
      setIsLoading(false);
    }
  };

  const updateProfile = async (params: {
    name?: string;
    monthly_income?: number;
    savings_target?: number;
  }): Promise<void> => {
    const { user: updatedUser } = await api.updateProfile(params);
    setUser(updatedUser);
  };

  const connectAccount = async (institutionName: string): Promise<ConnectedAccount> => {
    const result = await api.connectMockAccount(institutionName);
    await refreshAccounts();
    return result.account;
  };

  const hasConnectedAccount = accounts.some((acc) => acc.consent_granted === 1);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        accounts,
        hasConnectedAccount,
        isLoading,
        isAuthenticated: !!user && !!token,
        onboardingState,
        setOnboardingState,
        login,
        signup,
        logout,
        updateProfile,
        refreshAccounts,
        connectAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
