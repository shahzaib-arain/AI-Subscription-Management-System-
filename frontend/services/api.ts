import { Platform } from "react-native";

const getBaseUrl = () => {
  return "http://192.168.18.34:8080/api/v1";
};

export const API_BASE_URL = getBaseUrl();

export interface SignUpParams {
  fullName: string;
  email: string;
  password?: string; // Optional if you already have custom password fields
  phoneNumber: string;
}

export interface SignInParams {
  email: string;
  password?: string;
}

export interface ForgotPasswordParams {
  email: string;
}

export interface ResetPasswordParams {
  token: string;
  newPassword?: string;
}

export interface UserInfo {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  virtualCardNumber: string;
  role: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * The backend reports field-level validation problems (e.g. "Password must
 * contain uppercase, lowercase, digit, and special character") inside
 * `data`, keyed by field name — not just in the top-level `message`. Pull
 * those out so the real reason reaches the screen instead of a generic
 * "Validation failed".
 */
function extractErrorMessage(json: any, status: number): string {
  const fieldErrors = json?.data;
  if (fieldErrors && typeof fieldErrors === "object" && !Array.isArray(fieldErrors)) {
    const messages = Object.values(fieldErrors).filter(
      (value): value is string => typeof value === "string" && value.length > 0
    );
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }
  return json?.message || `Request failed with status ${status}. Please try again.`;
}

/**
 * Custom fetch wrapper that handles auth headers and parses responses
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }

  const text = await response.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(json, response.status));
  }

  return json as ApiResponse<T>;
}

export interface WalletData {
  id: number;
  balance: number;
  currency: string;
  frozen: boolean;
  updatedAt: string;
}

export interface WalletTransactionData {
  id: number;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

/**
 * Same request() core as every other call — this just attaches the bearer
 * token, so authenticated endpoints don't need their own fetch logic.
 */
async function authorizedRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  return request<T>(endpoint, { ...options, headers });
}

export const walletApi = {
  getWallet: (token: string) => authorizedRequest<WalletData>("/wallet", token),

  deposit: (token: string, amount: number) =>
    authorizedRequest<WalletData>("/wallet/deposit", token, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  freeze: (token: string) =>
    authorizedRequest<WalletData>("/wallet/freeze", token, { method: "POST" }),

  unfreeze: (token: string) =>
    authorizedRequest<WalletData>("/wallet/unfreeze", token, { method: "POST" }),

  getTransactions: (token: string) =>
    authorizedRequest<WalletTransactionData[]>("/wallet/transactions", token),
};

export const authApi = {
  signUp: (params: SignUpParams) => 
    request<AuthResponseData>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  signIn: (params: SignInParams) =>
    request<AuthResponseData>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  forgotPassword: (params: ForgotPasswordParams) =>
    request<void>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  resetPassword: (params: ResetPasswordParams) =>
    request<void>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(params),
    }),
};
