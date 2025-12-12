# Seen Backend Services

Privacy-focused incident reporting platform backend built with Spring Boot microservices architecture.

## 🏗️ Architecture Overview

### **Microservices**
- **Gateway Service** (Port 8080) - API routing, authentication, rate limiting
- **Auth Service** (Port 8081) - User management, JWT tokens, email verification
- **Report Service** (Port 8082) - Incident reports, timeline, status management
- **Analytics Service** (Port 8083) - Data aggregation with differential privacy
- **File Service** (Port 8084) - Secure uploads, virus scanning, metadata scrubbing
- **Support Service** (Port 8085) - Resource matching, location-based filtering
- **Notification Service** (Port 8086) - Email templates, delivery tracking

### **Technology Stack**
- **Framework**: Spring Boot 3.2+
- **Gateway**: Spring Cloud Gateway
- **Security**: Spring Security + JWT
- **Database**: PostgreSQL (primary), Redis (cache)
- **Message Queue**: RabbitMQ
- **File Storage**: MinIO/S3
- **Monitoring**: Spring Boot Actuator + Micrometer

## 🚀 Quick Start

### **Prerequisites**
- Java 17+
- Maven 3.8+
- Docker & Docker Compose

### **Development Setup**

1. **Clone and build**
   ```bash
   git clone <repository-url>
   cd seen-backend
   mvn clean package -DskipTests
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres redis rabbitmq minio
   ```

3. **Run services locally**
   ```bash
   # Terminal 1 - Gateway Service
   cd gateway-service
   mvn spring-boot:run
   
   # Terminal 2 - Auth Service
   cd auth-service
   mvn spring-boot:run
   
   # Terminal 3 - Report Service
   cd report-service
   mvn spring-boot:run
   ```

### **Docker Deployment**

```bash
# Build and start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📋 API Documentation

Once services are running, access API documentation:
- **Gateway**: http://localhost:8080/swagger-ui.html
- **Auth Service**: http://localhost:8081/swagger-ui.html
- **Report Service**: http://localhost:8082/swagger-ui.html

## 🔧 Configuration

### **Environment Variables**

```bash
# Database
DB_USERNAME=seen_user
DB_PASSWORD=seen_password

# JWT
JWT_SECRET=myVerySecretJWTKeyForProduction

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### **Profiles**
- `default` - Local development
- `docker` - Docker container deployment
- `kubernetes` - Kubernetes deployment

## 🧪 Testing

```bash
# Run unit tests
mvn test

# Run integration tests
mvn verify

# Run specific service tests
cd auth-service
mvn test
```

## 📊 Monitoring

### **Health Checks**
- Gateway: http://localhost:8080/actuator/health
- Auth: http://localhost:8081/actuator/health
- Reports: http://localhost:8082/actuator/health

### **Metrics**
- Prometheus: http://localhost:8080/actuator/prometheus
- Application metrics available at `/actuator/metrics`

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Security** with BCrypt and salt
- **Rate Limiting** on API endpoints
- **CORS Configuration** for frontend integration
- **Input Validation** with comprehensive DTO validation
- **Method Security** with role-based access control

## 📁 Project Structure

```
backend/
├── gateway-service/          # API Gateway
├── auth-service/            # Authentication & User Management
├── report-service/          # Incident Reports
├── analytics-service/       # Data Analytics
├── file-service/           # File Upload & Storage
├── support-service/        # Support Resources
├── notification-service/   # Email & Notifications
├── common/                 # Shared utilities
├── docker-compose.yml      # Development environment
└── README.md              # This file
```

## 🚀 Production Deployment

See individual service directories for:
- Kubernetes manifests
- Helm charts
- Production configuration
- Monitoring setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.