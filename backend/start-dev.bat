@echo off
REM Seen Backend Development Startup Script for Windows (Podman)

echo 🚀 Starting Seen Backend Services
echo =================================

REM Check if Podman is running
podman info >nul 2>&1
if errorlevel 1 (
    echo ❌ Podman is not running or not installed. Please start Podman first.
    exit /b 1
)

REM Check if Maven is installed
mvn -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Maven is not installed. Please install Maven first.
    exit /b 1
)

REM Start infrastructure services
echo 📦 Starting infrastructure services...
podman-compose up -d postgres redis rabbitmq minio

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Build all services
echo 🔨 Building services...
mvn clean compile -q

REM Create logs directory
if not exist logs mkdir logs

REM Start Gateway Service
echo 🚀 Starting Gateway Service on port 8080...
cd gateway-service
start "Gateway Service" cmd /c "mvn spring-boot:run > ../logs/gateway-service.log 2>&1"
cd ..

REM Wait a bit
timeout /t 5 /nobreak >nul

REM Start Auth Service
echo 🚀 Starting Auth Service on port 8081...
cd auth-service
start "Auth Service" cmd /c "mvn spring-boot:run > ../logs/auth-service.log 2>&1"
cd ..

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Test services
echo 🧪 Testing service health...
curl -s -f "http://localhost:8080/actuator/health" >nul 2>&1
if errorlevel 1 (
    echo ❌ Gateway Service is not responding
) else (
    echo ✅ Gateway Service is healthy
)

curl -s -f "http://localhost:8081/actuator/health" >nul 2>&1
if errorlevel 1 (
    echo ❌ Auth Service is not responding
) else (
    echo ✅ Auth Service is healthy
)

echo.
echo 🎉 Backend services are starting up!
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
echo 🛑 To stop services, run: stop-dev.bat
echo.
echo 🔗 Test the connection:
echo   curl http://localhost:8080/actuator/health
echo   node test-connection.js