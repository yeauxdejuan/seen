@echo off
REM Quick Integration Test Runner for Windows

echo 🧪 Running Backend-Frontend Integration Test
echo ============================================

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Set environment variables if needed
if "%BACKEND_URL%"=="" set BACKEND_URL=http://localhost:8080
if "%FRONTEND_URL%"=="" set FRONTEND_URL=https://yeauxdejuan.github.io/seen

echo Backend URL: %BACKEND_URL%
echo Frontend URL: %FRONTEND_URL%
echo.

REM Run the integration test
cd backend
node integration-test.js

REM Check result
if errorlevel 1 (
    echo.
    echo ❌ Integration test failed!
    echo Check the output above for details.
) else (
    echo.
    echo ✅ Integration test passed!
    echo Backend is ready for frontend integration.
)

echo.
pause