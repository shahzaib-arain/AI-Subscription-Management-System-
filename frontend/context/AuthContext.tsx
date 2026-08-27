import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import {
  authApi,
  walletApi,
  userApi,
  SignUpParams,
  SignInParams,
  UserInfo,
  ForgotPasswordParams,
  ResetPasswordParams,
  WalletData,
  WalletTransactionData,
} from "../services/api";
import { registerForPushNotifications } from "../utils/push-notifications";

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  wallet: WalletData | null;
  walletTransactions: WalletTransactionData[];
  walletLoading: boolean;
  walletError: string | null;
  login: (params: SignInParams) => Promise<void>;
  register: (params: SignUpParams) => Promise<void>;
  logout: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  deposit: (amount: number) => Promise<void>;
  freezeWallet: () => Promise<void>;
  unfreezeWallet: () => Promise<void>;
  clearError: () => void;
  forgotPassword: (params: ForgotPasswordParams) => Promise<void>;
  resetPassword: (params: ResetPasswordParams) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isWeb = Platform.OS === "web";

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isWeb && typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isWeb && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (isWeb && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn("Storage remove error:", e);
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransactionData[]>([]);
  const [walletLoading, setWalletLoading] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // The single place wallet state is ever fetched from the server — called
  // right after login/register and again on cold start, so it's always
  // real backend data and never a value guessed at locally.
  const loadWallet = async (activeToken: string) => {
    setWalletLoading(true);
    setWalletError(null);
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        walletApi.getWallet(activeToken),
        walletApi.getTransactions(activeToken),
      ]);
      setWallet(walletRes.data);
      setWalletTransactions(transactionsRes.data);
    } catch (e: any) {
      setWalletError(e.message || "Failed to load wallet.");
    } finally {
      setWalletLoading(false);
    }
  };

  // Push registration is best-effort and must never block or fail a login —
  // web, simulators, and denied permission all just quietly return null.
  const registerPush = (activeToken: string) => {
    registerForPushNotifications()
      .then((pushToken) => (pushToken ? userApi.registerPushToken(activeToken, pushToken) : null))
      .catch(() => {});
  };

  // The one place a token turns into a fully-loaded session — called from
  // cold-start restore, login, and sign-up alike, so wallet loading and push
  // registration only ever need to be wired up once.
  const onAuthenticated = async (activeToken: string) => {
    await loadWallet(activeToken);
    registerPush(activeToken);
  };

  // Load auth state from storage on startup
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedToken = await safeStorage.getItem("np_token");
        const storedUser = await safeStorage.getItem("np_user");

        if (storedToken) {
          setToken(storedToken);
          await onAuthenticated(storedToken);
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load auth state", e);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (params: SignInParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.signIn(params);
      const { accessToken, user: userData } = response.data;

      setToken(accessToken);
      setUser(userData);

      await safeStorage.setItem("np_token", accessToken);
      await safeStorage.setItem("np_user", JSON.stringify(userData));

      await onAuthenticated(accessToken);
    } catch (e: any) {
      setError(e.message || "Failed to sign in. Please try again.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (params: SignUpParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.signUp(params);
      const { accessToken, user: userData } = response.data;

      setToken(accessToken);
      setUser(userData);

      await safeStorage.setItem("np_token", accessToken);
      await safeStorage.setItem("np_user", JSON.stringify(userData));

      await onAuthenticated(accessToken);
    } catch (e: any) {
      setError(e.message || "Failed to create account. Please check inputs.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setToken(null);
      setUser(null);
      setWallet(null);
      setWalletTransactions([]);
      setWalletError(null);
      await safeStorage.removeItem("np_token");
      await safeStorage.removeItem("np_user");
    } catch (e) {
      console.error("Failed to logout cleanly", e);
    } finally {
      setLoading(false);
    }
  };

  const refreshWallet = async () => {
    if (!token) return;
    await loadWallet(token);
  };

  const deposit = async (amount: number) => {
    if (!token || isNaN(amount) || amount <= 0) return;
    const response = await walletApi.deposit(token, amount);
    setWallet(response.data);
    // Only the transaction list is stale after a deposit — the wallet
    // itself just came back in the response above, no need to re-fetch it.
    const transactionsRes = await walletApi.getTransactions(token);
    setWalletTransactions(transactionsRes.data);
  };

  const freezeWallet = async () => {
    if (!token) return;
    const response = await walletApi.freeze(token);
    setWallet(response.data);
  };

  const unfreezeWallet = async () => {
    if (!token) return;
    const response = await walletApi.unfreeze(token);
    setWallet(response.data);
  };

  const forgotPassword = async (params: ForgotPasswordParams) => {
    setError(null);
    try {
      await authApi.forgotPassword(params);
    } catch (e: any) {
      setError(e.message || "Failed to request password reset.");
      throw e;
    }
  };

  const resetPassword = async (params: ResetPasswordParams) => {
    setError(null);
    try {
      await authApi.resetPassword(params);
    } catch (e: any) {
      setError(e.message || "Failed to reset password.");
      throw e;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        wallet,
        walletTransactions,
        walletLoading,
        walletError,
        login,
        register,
        logout,
        refreshWallet,
        deposit,
        freezeWallet,
        unfreezeWallet,
        clearError,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
