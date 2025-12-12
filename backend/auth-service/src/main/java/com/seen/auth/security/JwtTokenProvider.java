package com.seen.auth.security;

import com.seen.auth.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class JwtTokenProvider {
    
    private final SecretKey key;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;
    private final RedisTemplate<String, String> redisTemplate;
    
    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh-expiration}") long refreshTokenExpiration,
            RedisTemplate<String, String> redisTemplate) {
        
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
        this.redisTemplate = redisTemplate;
    }
    
    public String generateAccessToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration);
        
        return Jwts.builder()
            .setSubject(user.getId().toString())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .claim("email", user.getEmail())
            .claim("roles", List.of(user.getRole().name()))
            .claim("type", "access")
            .signWith(key, SignatureAlgorithm.HS512)
            .compact();
    }
    
    public String generateRefreshToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpiration);
        
        String token = Jwts.builder()
            .setSubject(user.getId().toString())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .claim("type", "refresh")
            .signWith(key, SignatureAlgorithm.HS512)
            .compact();
            
        // Store refresh token in Redis
        String redisKey = "refresh_token:" + user.getId();
        redisTemplate.opsForValue().set(redisKey, token, refreshTokenExpiration, TimeUnit.MILLISECONDS);
        
        return token;
    }
    
    public String generateEmailVerificationToken(UUID userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + TimeUnit.HOURS.toMillis(24)); // 24 hours
        
        return Jwts.builder()
            .setSubject(userId.toString())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .claim("type", "email_verification")
            .signWith(key, SignatureAlgorithm.HS512)
            .compact();
    }
    
    public boolean validateToken(String token) {
        try {
            // Check if token is blacklisted
            if (isTokenBlacklisted(token)) {
                return false;
            }
            
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
    
    public boolean validateEmailVerificationToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
                
            return "email_verification".equals(claims.get("type"));
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid email verification token: {}", e.getMessage());
            return false;
        }
    }
    
    public UUID getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody();
            
        return UUID.fromString(claims.getSubject());
    }
    
    public void blacklistToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
                
            Date expiration = claims.getExpiration();
            long ttl = expiration.getTime() - System.currentTimeMillis();
            
            if (ttl > 0) {
                String redisKey = "blacklisted_token:" + token;
                redisTemplate.opsForValue().set(redisKey, "true", ttl, TimeUnit.MILLISECONDS);
            }
        } catch (JwtException e) {
            log.error("Error blacklisting token: {}", e.getMessage());
        }
    }
    
    private boolean isTokenBlacklisted(String token) {
        String redisKey = "blacklisted_token:" + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(redisKey));
    }
    
    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }
}