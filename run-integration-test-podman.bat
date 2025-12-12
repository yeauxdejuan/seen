@echo off
REM Integration Test Script for Podman Backend

echo 🧪 Running Backend Integration Tests (Podman)
echo =============================================

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if backend services are running
echo 🔍 Checking if backend services are running...

curl -s -f "http://localhost:8080/actuator/health" >nul 2>&1
if errorlevel 1 (
    echo ❌ Gateway Service is not running on port 8080
    echo    Please run: backend\start-dev-podman.bat
    exit /b 1
) else (
    echo ✅ Gateway Service is running
)

curl -s -f "http://localhost:8081/actuator/health" >nul 2>&1
if errorlevel 1 (
    echo ❌ Auth Service is not running on port 8081
    echo    Please run: backend\start-dev-podman.bat
    exit /b 1
) else (
    echo ✅ Auth Service is running
)

echo.
echo 🚀 Running integration tests...
echo.

REM Run the integration test
node backend\integration-test.js

echo.
echo 📊 Integration test completed!
echo.
echo 💡 To view service logs:
echo    type backend\logs\gateway-service.log
echo    type backend\logs\auth-service.log