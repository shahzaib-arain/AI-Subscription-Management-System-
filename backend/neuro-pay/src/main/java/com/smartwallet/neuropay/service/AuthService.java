package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.request.*;
import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.AuthResponse;

public interface AuthService {
    ApiResponse<AuthResponse> signUp(SignUpRequest request);
    ApiResponse<AuthResponse> signIn(SignInRequest request);
    ApiResponse<Void> forgotPassword(ForgotPasswordRequest request);
    ApiResponse<Void> resetPassword(ResetPasswordRequest request);
}