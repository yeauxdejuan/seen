@echo off
REM Seen Backend Development Startup Script for Windows (Podman)

echo 🚀 Starting Seen Backend Services with Podman
echo ===============================================

REM Check if Podman is installed
podman --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Podman is not installed. Please install Podman first.
    echo    Download from: https://podman.io/getting-started/installation
    exit /b 1
)

REM Check if Maven is installed
mvn -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Maven is not installed. Please install Maven first.
    exit /b 1
)

REM Create Podman network if it doesn't exist
echo 🌐 Creating Podman network...
podman network create seen-network 2>nul

REM Start infrastructure services individually with Podman
echo 📦 Starting PostgreSQL...
podman run -d --name seen-postgres --network seen-network ^
    -e POSTGRES_DB=seen_db ^
    -e POSTGRES_USER=seen_user ^
    -e POSTGRES_PASSWORD=seen_password ^
    -p 5432:5432 ^
    postgres:15-alpine

echo 📦 Starting Redis...
podman run -d --name seen-redis --network seen-network ^
    -p 6379:6379 ^
    redis:7-alpine

echo 📦 Starting RabbitMQ...
podman run -d --name seen-rabbitmq --network seen-network ^
    -e RABBITMQ_DEFAULT_USER=seen_user ^
    -e RABBITMQ_DEFAULT_PASS=seen_password ^
    -p 5672:5672 ^
    -p 15672:15672 ^
    rabbitmq:3-management-alpine

echo 📦 Starting MinIO...
podman run -d --name seen-minio --network seen-network ^
    -e MINIO_ROOT_USER=seen_user ^
    -e MINIO_ROOT_PASSWORD=seen_password ^
    -p 9000:9000 ^
    -p 9001:9001 ^
    minio/minio:latest server /data --console-address ":9001"

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 15 /nobreak >nul

REM Build all services
echo 🔨 Building services...
mvn clean compile -q

REM Create logs directory
if not exist logs mkdir logs

REM Start Gateway Service
echo 🚀 Starting Gateway Service on port 8080...
cd gateway-service
start "Gateway Service" cmd /c "mvn spring-boot:run -Dspring.profiles.active=local > ../logs/gateway-service.log 2>&1"
cd ..

REM Wait a bit
timeout /t 5 /nobreak >nul

REM Start Auth Service
echo 🚀 Starting Auth Service on port 8081...
cd auth-service
start "Auth Service" cmd /c "mvn spring-boot:run -Dspring.profiles.active=local > ../logs/auth-service.log 2>&1"
cd ..

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 20 /nobreak >nul

REM Test services
echo 🧪 Testing service health...
curl -s -f "http://localhost:8080/actuator/health" >nul 2>&1
if errorlevel 1 (
    echo ❌ Gateway Service is not responding
    echo    Check logs/gateway-service.log for details
) else (
    echo ✅ Gateway Service is healthy
)

curl -s -f "http://localhost:8081/actuator/health" >nul 2>&1
if errorlevel 1 (
    echo ❌ Auth Service is not responding
    echo    Check logs/auth-service.log for details
) else (
    echo ✅ Auth Service is healthy
)

echo.
echo 🎉 Backend services are running with Podman!
echo.
echo 📊 Service Status:
echo   Gateway Service:  http://localhost:8080
echo   Auth Service:     http://localhost:8081
echo   PostgreSQL:       localhost:5432
echo   Redis:            localhost:6379
echo   RabbitMQ:         http://localhost:15672 (seen_user/seen_password)
echo   MinIO:            http://localhost:9001 (seen_user/seen_password)
echo.
echo 📝 Logs are available in the logs/ directory
echo 🛑 To stop services, run: stop-dev-podman.bat
echo.
echo 🔗 Test the connection:
echo   curl http://localhost:8080/actuator/health
echo   node test-connection.js
echo.
echo 📋 Podman containers:
podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"