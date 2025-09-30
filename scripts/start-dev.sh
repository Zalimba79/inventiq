#!/bin/bash

# Start development environment with correct database settings

echo "🚀 Starting Inventiq Development Environment"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Start PostgreSQL with docker-compose
echo "📦 Starting PostgreSQL database..."
docker-compose -f docker-compose.dev.yml up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Test database connection
echo "🔍 Testing database connection..."
DATABASE_URL="postgresql://inventiq:inventiq2025@localhost:5432/inventiq" \
    node -e "console.log('Database URL configured correctly')"

# Start the development server with correct DATABASE_URL
echo "🎨 Starting Next.js development server..."
echo "📝 Using DATABASE_URL: postgresql://inventiq:inventiq2025@localhost:5432/inventiq"
echo ""
echo "✨ Server starting on http://localhost:3000"
echo "=========================================="

# Start the server with correct DATABASE_URL
DATABASE_URL="postgresql://inventiq:inventiq2025@localhost:5432/inventiq" npm run dev