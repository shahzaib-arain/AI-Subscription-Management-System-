import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import { 
  authApi, 
  SignUpParams, 
  SignInParams, 
  UserInfo, 
  ForgotPasswordParams, 
  ResetPasswordParams 
} from "../services/api";

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  walletBalance: number;
  loading: boolean;
  error: string | null;
  login: (params: SignInParams) => Promise<void>;
  register: (params: SignUpParams) => Promise<void>;
  logout: () => Promise<void>;
  deposit: (amount: number) => Promise<void>;
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
  const [walletBalance, setWalletBalance] = useState<number>(500.00); // Default balance
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load auth state from storage on startup
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedToken = await safeStorage.getItem("np_token");
        const storedUser = await safeStorage.getItem("np_user");
        const storedBalance = await safeStorage.getItem("np_balance");

        if (storedToken) {
          setToken(storedToken);
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedBalance) {
          setWalletBalance(parseFloat(storedBalance));
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

      // Retrieve or initialize balance
      const storedBalance = await safeStorage.getItem("np_balance");
      if (!storedBalance) {
        await safeStorage.setItem("np_balance", "500.00");
        setWalletBalance(500.00);
      } else {
        setWalletBalance(parseFloat(storedBalance));
      }
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
      setWalletBalance(500.00); // Initialize new user balance

      await safeStorage.setItem("np_token", accessToken);
      await safeStorage.setItem("np_user", JSON.stringify(userData));
      await safeStorage.setItem("np_balance", "500.00");
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
      await safeStorage.removeItem("np_token");
      await safeStorage.removeItem("np_user");
    } catch (e) {
      console.error("Failed to logout cleanly", e);
    } finally {
      setLoading(false);
    }
  };

  const deposit = async (amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    try {
      const newBalance = walletBalance + amount;
      setWalletBalance(newBalance);
      await safeStorage.setItem("np_balance", newBalance.toFixed(2));
    } catch (e) {
      console.error("Failed to save deposited balance", e);
    }
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
        walletBalance,
        loading,
        error,
        login,
        register,
        logout,
        deposit,
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
