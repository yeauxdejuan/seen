#!/bin/bash

# Seen Backend Development Startup Script

echo "🚀 Starting Seen Backend Services"
echo "================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven first."
    exit 1
fi

# Start infrastructure services
echo "📦 Starting infrastructure services..."
docker-compose up -d postgres redis rabbitmq minio

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are healthy
echo "🔍 Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U seen_user > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "⚠️  PostgreSQL is not ready yet, continuing anyway..."
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "⚠️  Redis is not ready yet, continuing anyway..."
fi

# Build all services
echo "🔨 Building services..."
mvn clean compile -q

# Function to start a service in background
start_service() {
    local service_name=$1
    local port=$2
    
    echo "🚀 Starting $service_name on port $port..."
    
    cd $service_name
    mvn spring-boot:run > ../logs/$service_name.log 2>&1 &
    local pid=$!
    echo $pid > ../logs/$service_name.pid
    cd ..
    
    echo "   PID: $pid"
}

# Create logs directory
mkdir -p logs

# Start services
start_service "gateway-service" "8080"
sleep 5
start_service "auth-service" "8081"
sleep 5

# Wait a bit for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Test services
echo "🧪 Testing service health..."

test_endpoint() {
    local url=$1
    local name=$2
    
    if curl -s -f "$url" > /dev/null; then
        echo "✅ $name is healthy"
    else
        echo "❌ $name is not responding"
    fi
}

test_endpoint "http://localhost:8080/actuator/health" "Gateway Service"
test_endpoint "http://localhost:8081/actuator/health" "Auth Service"

# Test CORS
echo "🌐 Testing CORS configuration..."
cors_response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Origin: https://yeauxdejuan.github.io" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization" \
    -X OPTIONS \
    http://localhost:8080/api/auth/login)

if [ "$cors_response" = "200" ]; then
    echo "✅ CORS is configured correctly"
else
    echo "⚠️  CORS might not be configured correctly (Status: $cors_response)"
fi

echo ""
echo "🎉 Backend services are starting up!"
echo ""
echo "📊 Service Status:"
echo "  Gateway Service:  http://localhost:8080"
echo "  Auth Service:     http://localhost:8081"
echo "  PostgreSQL:       localhost:5432"
echo "  Redis:            localhost:6379"
echo "  RabbitMQ:         http://localhost:15672 (admin/admin)"
echo "  MinIO:            http://localhost:9001 (seen_user/seen_password)"
echo ""
echo "📝 Logs are available in the logs/ directory"
echo "🛑 To stop services, run: ./stop-dev.sh"
echo ""
echo "🔗 Test the connection:"
echo "  curl http://localhost:8080/actuator/health"
echo "  node test-connection.js"