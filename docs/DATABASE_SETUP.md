# Database Setup Guide

## Quick Start

### Method 1: Using the start script (Recommended)
```bash
./scripts/start-dev.sh
```
This script will:
- Check if Docker is running
- Start PostgreSQL container
- Start the development server with correct credentials

### Method 2: Using npm scripts
```bash
# Start the database
npm run db:start

# Then start the development server with correct DATABASE_URL
npm run dev:db
```

### Method 3: Manual setup
```bash
# Start PostgreSQL with docker-compose
docker-compose -f docker-compose.dev.yml up -d postgres

# Start dev server with correct DATABASE_URL
DATABASE_URL="postgresql://inventiq:inventiq2025@localhost:5432/inventiq" npm run dev
```

## Database Credentials

| Setting | Value |
|---------|-------|
| Host | localhost |
| Port | 5432 |
| Database | inventiq |
| Username | inventiq |
| Password | inventiq2025 |

## Connection String
```
postgresql://inventiq:inventiq2025@localhost:5432/inventiq
```

## Troubleshooting

### Error: "Authentication failed for user postgres"
**Problem**: The application is using wrong credentials (postgres/password)
**Solution**: 
1. Make sure you don't have DATABASE_URL set in your shell environment:
   ```bash
   unset DATABASE_URL
   ```
2. Use `npm run dev:db` instead of `npm run dev`
3. Or use the start script: `./scripts/start-dev.sh`

### Error: "Can't reach database server"
**Problem**: PostgreSQL container is not running
**Solution**:
1. Start Docker Desktop
2. Run: `docker-compose -f docker-compose.dev.yml up -d postgres`
3. Wait 5 seconds for database to be ready

### Error: "Port 5432 is already in use"
**Problem**: Another PostgreSQL instance is running
**Solution**:
1. Stop other PostgreSQL: `brew services stop postgresql` (if using Homebrew)
2. Or change the port in docker-compose.dev.yml

## pgAdmin Access
pgAdmin is available at http://localhost:5050
- Email: admin@inventiq.local
- Password: admin
- Database connection is pre-configured

## Docker Commands

```bash
# Start all services (PostgreSQL + pgAdmin)
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f postgres

# Reset database (CAUTION: Deletes all data)
docker-compose -f docker-compose.dev.yml down -v
```