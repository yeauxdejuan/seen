#!/bin/bash

# Seen Backend Development Stop Script

echo "🛑 Stopping Seen Backend Services"
echo "================================="

# Stop Spring Boot services
if [ -d "logs" ]; then
    for pidfile in logs/*.pid; do
        if [ -f "$pidfile" ]; then
            service_name=$(basename "$pidfile" .pid)
            pid=$(cat "$pidfile")
            
            if kill -0 "$pid" 2>/dev/null; then
                echo "🛑 Stopping $service_name (PID: $pid)..."
                kill "$pid"
                
                # Wait for graceful shutdown
                sleep 3
                
                # Force kill if still running
                if kill -0 "$pid" 2>/dev/null; then
                    echo "   Force killing $service_name..."
                    kill -9 "$pid"
                fi
            else
                echo "   $service_name was not running"
            fi
            
            rm "$pidfile"
        fi
    done
fi

# Stop Docker services
echo "🐳 Stopping Docker services..."
docker-compose down

echo ""
echo "✅ All services stopped!"
echo "📝 Logs are preserved in the logs/ directory"