package com.seen.auth.service;

import com.seen.auth.dto.*;
import com.seen.auth.entity.User;
import com.seen.auth.entity.UserRole;
import com.seen.auth.exception.AuthenticationException;
import com.seen.auth.exception.UserAlreadyExistsException;
import com.seen.auth.repository.UserRepository;
import com.seen.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    
    public UserResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User with email already exists");
        }
        
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        
        String salt = UUID.randomUUID().toString();
        String hashedPassword = passwordEncoder.encode(request.getPassword() + salt);
        
        User user = User.builder()
            .email(request.getEmail())
            .passwordHash(hashedPassword)
            .salt(salt)
            .role(UserRole.USER)
            .emailVerified(false)
            .twoFactorEnabled(false)
            .createdAt(LocalDateTime.now())
            .build();
        
        User savedUser = userRepository.save(user);
        
        // Send verification email
        String verificationToken = jwtTokenProvider.generateEmailVerificationToken(savedUser.getId());
        emailService.sendVerificationEmail(savedUser.getEmail(), verificationToken);
        
        log.info("User registered successfully: {}", savedUser.getEmail());
        return mapToUserResponseDto(savedUser);
    }
    
    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new AuthenticationException("Invalid credentials"));
        
        String hashedPassword = passwordEncoder.encode(request.getPassword() + user.getSalt());
        if (!hashedPassword.equals(user.getPasswordHash())) {
            throw new AuthenticationException("Invalid credentials");
        }
        
        if (!user.getEmailVerified()) {
            throw new AuthenticationException("Email not verified");
        }
        
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        
        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        log.info("User logged in successfully: {}", user.getEmail());
        
        return LoginResponseDto.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getAccessTokenExpiration())
            .user(mapToUserResponseDto(user))
            .build();
    }
    
    public LoginResponseDto refreshToken(String refreshToken) {
        String token = refreshToken.replace("Bearer ", "");
        
        if (!jwtTokenProvider.validateToken(token)) {
            throw new AuthenticationException("Invalid refresh token");
        }
        
        UUID userId = jwtTokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AuthenticationException("User not found"));
        
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);
        
        return LoginResponseDto.builder()
            .accessToken(newAccessToken)
            .refreshToken(newRefreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getAccessTokenExpiration())
            .user(mapToUserResponseDto(user))
            .build();
    }
    
    public void logout(String token) {
        jwtTokenProvider.blacklistToken(token.replace("Bearer ", ""));
        log.info("User logged out successfully");
    }
    
    public void verifyEmail(String token) {
        if (!jwtTokenProvider.validateEmailVerificationToken(token)) {
            throw new AuthenticationException("Invalid verification token");
        }
        
        UUID userId = jwtTokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AuthenticationException("User not found"));
        
        user.setEmailVerified(true);
        userRepository.save(user);
        
        log.info("Email verified for user: {}", user.getEmail());
    }
    
    private UserResponseDto mapToUserResponseDto(User user) {
        return UserResponseDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getProfile() != null ? user.getProfile().getFirstName() : null)
            .lastName(user.getProfile() != null ? user.getProfile().getLastName() : null)
            .role(user.getRole().name())
            .emailVerified(user.getEmailVerified())
            .twoFactorEnabled(user.getTwoFactorEnabled())
            .createdAt(user.getCreatedAt())
            .lastLoginAt(user.getLastLoginAt())
            .build();
    }
}