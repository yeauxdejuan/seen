package com.seen.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Column(nullable = false)
    private String salt;
    
    @Embedded
    private UserProfile profile;
    
    @Embedded
    private PrivacySettings privacySettings;
    
    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.USER;
    
    @Column(nullable = false)
    private Boolean emailVerified = false;
    
    @Column(nullable = false)
    private Boolean twoFactorEnabled = false;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private LocalDateTime lastLoginAt;
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {
    private String firstName;
    private String lastName;
    private String phone;
    private String timezone = "UTC";
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrivacySettings {
    private Boolean dataSharing = false;
    private Boolean analyticsParticipation = true;
    private Boolean contactConsent = false;
}

public enum UserRole {
    USER, ADMIN, MODERATOR
}