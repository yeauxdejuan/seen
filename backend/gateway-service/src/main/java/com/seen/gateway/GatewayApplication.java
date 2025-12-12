package com.seen.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

@SpringBootApplication
public class GatewayApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("auth-service", r -> r
                .path("/api/auth/**")
                .filters(f -> f.stripPrefix(2))
                .uri("lb://auth-service"))
            .route("report-service", r -> r
                .path("/api/reports/**")
                .filters(f -> f
                    .stripPrefix(2)
                    .requestRateLimiter(config -> config
                        .setRateLimiter(redisRateLimiter())
                        .setKeyResolver(userKeyResolver())))
                .uri("lb://report-service"))
            .route("analytics-service", r -> r
                .path("/api/analytics/**")
                .filters(f -> f.stripPrefix(2))
                .uri("lb://analytics-service"))
            .route("file-service", r -> r
                .path("/api/files/**")
                .filters(f -> f.stripPrefix(2))
                .uri("lb://file-service"))
            .route("support-service", r -> r
                .path("/api/support/**")
                .filters(f -> f.stripPrefix(2))
                .uri("lb://support-service"))
            .build();
    }
    
    @Bean
    @Primary
    public RedisRateLimiter redisRateLimiter() {
        return new RedisRateLimiter(10, 20, 1);
    }
    
    @Bean
    @Primary
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String userId = exchange.getRequest().getHeaders().getFirst("X-User-ID");
            return Mono.just(userId != null ? userId : "anonymous");
        };
    }
}