# Seen Backend Architecture - Spring Boot Microservices

## 🏗️ Architecture Overview

### **Technology Stack**
- **Framework**: Spring Boot 3.2+
- **Gateway**: Spring Cloud Gateway
- **Security**: Spring Security + JWT
- **Database**: PostgreSQL (primary), Redis (cache)
- **Message Queue**: RabbitMQ
- **File Storage**: AWS S3 / MinIO
- **Monitoring**: Spring Boot Actuator + Micrometer
- **Documentation**: OpenAPI 3 (Swagger)

### **Microservices Design**

## 1. **Gateway Service** (Port: 8080)
```yaml
Dependencies:
  - spring-cloud-starter-gateway
  - spring-boot-starter-security
  - spring-boot-starter-data-redis
```

**Responsibilities:**
- Route requests to appropriate services
- Authentication & authorization
- Rate limiting & throttling
- CORS configuration
- Request/response logging

## 2. **Auth Service** (Port: 8081)
```yaml
Dependencies:
  - spring-boot-starter-web
  - spring-boot-starter-security
  - spring-boot-starter-data-jpa
  - spring-boot-starter-validation
  - lombok
  - jjwt-api
```

**Responsibilities:**
- User registration & login
- JWT token generation/validation
- Password encryption & management
- User profile management
- Two-factor authentication

## 3. **Report Service** (Port: 8082)
```yaml
Dependencies:
  - spring-boot-starter-web
  - spring-boot-starter-data-jpa
  - spring-boot-starter-validation
  - spring-boot-starter-amqp
  - lombok
  - mapstruct
```

**Responsibilities:**
- CRUD operations for incident reports
- Report validation & sanitization
- Draft management & auto-save
- Report status tracking
- Timeline management

## 4. **Analytics Service** (Port: 8083)
```yaml
Dependencies:
  - spring-boot-starter-web
  - spring-boot-starter-data-jpa
  - spring-boot-starter-data-redis
  - spring-boot-starter-amqp
  - lombok
```

**Responsibilities:**
- Aggregate anonymized data
- Generate analytics & insights
- Trend analysis & reporting
- Data privacy & differential privacy
- Caching aggregated results

## 5. **File Service** (Port: 8084)
```yaml
Dependencies:
  - spring-boot-starter-web
  - spring-cloud-starter-aws
  - spring-boot-starter-validation
  - lombok
  - tika-core (file type detection)
```

**Responsibilities:**
- Secure file upload/download
- File metadata scrubbing
- Virus scanning integration
- File encryption at rest
- Thumbnail generation

## 6. **Support Service** (Port: 8085)
```yaml
Dependencies:
  - spring-boot-starter-web
  - spring-boot-starter-data-jpa
  - spring-boot-starter-data-redis
  - lombok
```

**Responsibilities:**
- Support resource management
- Location-based resource filtering
- Resource recommendation engine
- Contact information management

## 7. **Notification Service** (Port: 8086)
```yaml
Dependencies:
  - spring-boot-starter-web
  - spring-boot-starter-mail
  - spring-boot-starter-amqp
  - spring-boot-starter-thymeleaf
  - lombok
```

**Responsibilities:**
- Email notifications
- SMS notifications (Twilio)
- Push notifications
- Notification templates
- Delivery tracking

---

## 📋 Core Entity Models

### **User Entity** (Auth Service)
```java
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
    @Email
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
    private UserRole role;
    
    @Column(nullable = false)
    private Boolean emailVerified = false;
    
    @Column(nullable = false)
    private Boolean twoFactorEnabled = false;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### **Incident Report Entity** (Report Service)
```java
@Entity
@Table(name = "incident_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private UUID userId;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String narrative;
    
    @ElementCollection
    @Enumerated(EnumType.STRING)
    private Set<IncidentType> incidentTypes;
    
    @ElementCollection
    private Set<String> tags;
    
    @Embedded
    private ReportLocation location;
    
    @Embedded
    private IncidentTiming timing;
    
    @Embedded
    private ImpactDetails impact;
    
    @Embedded
    private Demographics demographics;
    
    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.DRAFT;
    
    @Column(nullable = false)
    private Boolean openToContact = false;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "reportId", cascade = CascadeType.ALL)
    private List<ReportTimeline> timeline;
    
    @OneToMany(mappedBy = "reportId", cascade = CascadeType.ALL)
    private List<ReportAttachment> attachments;
}
```

### **Analytics Aggregate Entity** (Analytics Service)
```java
@Entity
@Table(name = "analytics_aggregates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsAggregate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Enumerated(EnumType.STRING)
    private AggregateType type; // BY_TYPE, BY_LOCATION, BY_TIME
    
    @Column(nullable = false)
    private String dimension; // incident_type, location, month
    
    @Column(nullable = false)
    private String value; // workplace_bias, chicago_il, 2024-01
    
    @Column(nullable = false)
    private Long count;
    
    @Column(nullable = false)
    private Double noisyCount; // Differential privacy applied
    
    @Column(nullable = false)
    private LocalDate aggregateDate;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

---

## 🔧 Key Implementation Details

### **1. Gateway Configuration**
```yaml
# application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: auth-service
          uri: lb://auth-service
          predicates:
            - Path=/api/auth/**
          filters:
            - StripPrefix=2
            
        - id: report-service
          uri: lb://report-service
          predicates:
            - Path=/api/reports/**
          filters:
            - StripPrefix=2
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
```

### **2. Security Configuration**
```java
@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class GatewaySecurityConfig {
    
    private final JwtAuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
            .csrf().disable()
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authenticationManager(authenticationManager)
            .securityContextRepository(securityContextRepository)
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/api/auth/login", "/api/auth/register").permitAll()
                .pathMatchers("/api/analytics/public/**").permitAll()
                .anyExchange().authenticated()
            )
            .build();
    }
}
```

### **3. Report Service Controller**
```java
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Validated
@Slf4j
public class ReportController {
    
    private final ReportService reportService;
    private final ReportMapper reportMapper;
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ReportResponseDto> createReport(
            @Valid @RequestBody CreateReportDto createReportDto,
            Authentication authentication) {
        
        UUID userId = UUID.fromString(authentication.getName());
        IncidentReport report = reportService.createReport(createReportDto, userId);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(reportMapper.toResponseDto(report));
    }
    
    @GetMapping("/{reportId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ReportDetailDto> getReport(
            @PathVariable UUID reportId,
            Authentication authentication) {
        
        UUID userId = UUID.fromString(authentication.getName());
        IncidentReport report = reportService.getReportByIdAndUserId(reportId, userId);
        
        return ResponseEntity.ok(reportMapper.toDetailDto(report));
    }
    
    @PutMapping("/{reportId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ReportResponseDto> updateReport(
            @PathVariable UUID reportId,
            @Valid @RequestBody UpdateReportDto updateReportDto,
            Authentication authentication) {
        
        UUID userId = UUID.fromString(authentication.getName());
        IncidentReport report = reportService.updateReport(reportId, updateReportDto, userId);
        
        return ResponseEntity.ok(reportMapper.toResponseDto(report));
    }
}
```

### **4. Analytics Service with Differential Privacy**
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {
    
    private final AnalyticsRepository analyticsRepository;
    private final DifferentialPrivacyService privacyService;
    
    @Cacheable(value = "analytics", key = "#aggregateType")
    public List<AnalyticsDto> getAggregatedData(AggregateType aggregateType) {
        List<AnalyticsAggregate> aggregates = analyticsRepository
            .findByTypeAndAggregateDate(aggregateType, LocalDate.now());
            
        return aggregates.stream()
            .map(this::applyPrivacyAndMap)
            .collect(Collectors.toList());
    }
    
    private AnalyticsDto applyPrivacyAndMap(AnalyticsAggregate aggregate) {
        double noisyCount = privacyService.addLaplaceNoise(
            aggregate.getCount().doubleValue(), 
            1.0 // epsilon value for privacy
        );
        
        return AnalyticsDto.builder()
            .dimension(aggregate.getDimension())
            .value(aggregate.getValue())
            .count(Math.max(0, Math.round(noisyCount))) // Ensure non-negative
            .build();
    }
}
```

---

## 🚀 Deployment & Infrastructure

### **Docker Compose Setup**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: seen_db
      POSTGRES_USER: seen_user
      POSTGRES_PASSWORD: seen_password
    ports:
      - "5432:5432"
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
      
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
      
  gateway-service:
    build: ./gateway-service
    ports:
      - "8080:8080"
    depends_on:
      - redis
      - auth-service
      
  auth-service:
    build: ./auth-service
    ports:
      - "8081:8081"
    depends_on:
      - postgres
```

### **Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: report-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: report-service
  template:
    metadata:
      labels:
        app: report-service
    spec:
      containers:
      - name: report-service
        image: seen/report-service:latest
        ports:
        - containerPort: 8082
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "kubernetes"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
```

This architecture provides:
- ✅ **Scalable microservices** with clear separation of concerns
- ✅ **Security-first design** with JWT and Spring Security
- ✅ **Privacy protection** with differential privacy
- ✅ **High performance** with caching and async processing
- ✅ **Production-ready** with monitoring and observability
- ✅ **Cloud-native** with Docker and Kubernetes support