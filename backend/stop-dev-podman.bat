@echo off
REM Seen Backend Development Stop Script for Windows (Podman)

echo 🛑 Stopping Seen Backend Services (Podman)
echo ==========================================

echo 📦 Stopping and removing containers...
podman stop seen-postgres seen-redis seen-rabbitmq seen-minio 2>nul
podman rm seen-postgres seen-redis seen-rabbitmq seen-minio 2>nul

echo 🌐 Removing network...
podman network rm seen-network 2>nul

echo ✅ All services stopped and cleaned up!
echo.
echo 💡 To restart services, run: start-dev-podman.bat