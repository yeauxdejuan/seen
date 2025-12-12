package com.seen.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    public void sendVerificationEmail(String toEmail, String verificationToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Verify Your Email - Seen Platform");
            message.setText(buildVerificationEmailText(verificationToken));
            
            mailSender.send(message);
            log.info("Verification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", toEmail, e);
            // In production, you might want to queue this for retry
        }
    }
    
    private String buildVerificationEmailText(String verificationToken) {
        return String.format(
            "Welcome to Seen!\n\n" +
            "Please verify your email address by clicking the link below:\n" +
            "%s/verify-email?token=%s\n\n" +
            "This link will expire in 24 hours.\n\n" +
            "If you didn't create an account with Seen, please ignore this email.\n\n" +
            "Best regards,\n" +
            "The Seen Team",
            frontendUrl, verificationToken
        );
    }
}