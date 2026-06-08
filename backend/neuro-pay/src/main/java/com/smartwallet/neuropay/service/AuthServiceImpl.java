package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.request.*;
import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.AuthResponse;
import com.smartwallet.neuropay.entity.PasswordResetToken;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.enums.Role;
import com.smartwallet.neuropay.exception.InvalidTokenException;
import com.smartwallet.neuropay.exception.ResourceNotFoundException;
import com.smartwallet.neuropay.exception.UserAlreadyExistsException;
import com.smartwallet.neuropay.repository.PasswordResetTokenRepository;
import com.smartwallet.neuropay.repository.UserRepository;
import com.smartwallet.neuropay.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final VirtualCardService virtualCardService;
    private final MailService mailService;

    @Value("${application.frontend-url}")
    private String frontendUrl;

    @Value("${application.password-reset-token-expiry}")
    private int tokenExpiryMinutes;

    @Value("${application.jwt.expiration}")
    private long jwtExpiration;

    @Override
    @Transactional
    public ApiResponse<AuthResponse> signUp(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("An account with this email already exists.");
        }

        String virtualCardNumber = virtualCardService.generateUniqueVirtualCardNumber();

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .virtualCardNumber(virtualCardNumber)
                .role(Role.CUSTOMER)
                .build();

        userRepository.save(user);

        // Send welcome email asynchronously
        mailService.sendWelcomeEmail(user.getEmail(), user.getFullName(), virtualCardNumber);

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        log.info("New user registered: {}", user.getEmail());

        return ApiResponse.success("Account created successfully! Welcome to NeuroPay.", buildAuthResponse(user, accessToken, refreshToken));
    }

    @Override
    public ApiResponse<AuthResponse> signIn(SignInRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        log.info("User signed in: {}", user.getEmail());

        return ApiResponse.success("Signed in successfully.", buildAuthResponse(user, accessToken, refreshToken));
    }

    @Override
    @Transactional
    public ApiResponse<Void> forgotPassword(ForgotPasswordRequest request) {
        // Always return success to prevent email enumeration attacks
        userRepository.findByEmail(request.getEmail().toLowerCase().trim()).ifPresent(user -> {
            // Delete any existing tokens for this user
            tokenRepository.deleteAllByUserId(user.getId());

            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiresAt(LocalDateTime.now().plusMinutes(tokenExpiryMinutes))
                    .used(false)
                    .build();

            tokenRepository.save(resetToken);

            String resetLink = frontendUrl + "/reset-password?token=" + token;
            mailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);

            log.info("Password reset email triggered for: {}", user.getEmail());
        });

        return ApiResponse.success("If this email is registered, you'll receive a password reset link shortly.");
    }

    @Override
    @Transactional
    public ApiResponse<Void> resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired password reset token."));

        if (resetToken.isExpired()) {
            throw new InvalidTokenException("This password reset link has expired. Please request a new one.");
        }

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("This password reset link has already been used.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password reset successful for: {}", user.getEmail());

        return ApiResponse.success("Password has been reset successfully. Please sign in with your new password.");
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .virtualCardNumber(user.getVirtualCardNumber())
                        .role(user.getRole().name())
                        .build())
                .build();
    }
}