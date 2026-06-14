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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(json.message || `API Error: ${response.status}`);
  }

  return json as ApiResponse<T>;
}

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
