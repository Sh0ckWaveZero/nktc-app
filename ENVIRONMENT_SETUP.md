# 🔧 Environment Setup Guide

This guide explains how to properly configure environment variables for NKTC App development and deployment.

## 📋 Overview

The project uses separate environment files for different configurations:
- `.env.example` - Template files (safe to commit)
- `.env` / `.env.local` - Actual credentials (NEVER commit these)
- `.env.development` / `.env.production` - Environment-specific configs

**IMPORTANT**: All `.env` files are in `.gitignore`. Never commit actual credentials!

---

## 🚀 Quick Start: Local Development Setup

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Copy the example file:
```bash
cp .env.example .env.local
```

3. Edit `.env.local` with your local configuration:
```bash
# Frontend configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_EDUCATION_YEARS=2567
ANALYZE=false
```

4. Your `.env.local` is automatically ignored by git:
```bash
# Verify .gitignore is working
git status  # Should NOT show .env.local
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Copy the example file:
```bash
cp .env.example .env
```

3. Edit `.env` with your local configuration:
```bash
# Application
NODE_ENV=development
PORT=3001
APP_NAME="NKTC Backend API"

# Database (PostgreSQL)
DATABASE_URL="postgresql://adminpostgres:password@localhost:5433/edu?schema=public"

# MongoDB (optional, for logs/sessions)
MONGODB_DATABASE_URL="mongodb://localhost:27017/nktc_mongo"

# Authentication
JWT_SECRET="your-32-character-secret-key-here"
JWT_EXPIRES_IN="30m"
RT_SECRET="your-64-character-refresh-token-secret-here"

# File Storage (MinIO)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="vc3T9a31TwCfGF2I"
MINIO_SECRET_KEY="Mdr6hBwZZ8ITtvAmdkRtlQYjCcOZX7ak"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="nktc-app"

# Admin User (first-time setup)
USER_ADMIN="admin"
USER_PASSWORD="password"

# Host Configuration
HOST="localhost"
HOST_URL="http://localhost:3001"

# Education Years
EDUCATION_YEARS="2567"
```

---

## 🐳 Docker Development Setup

### Using Docker Compose

1. Use the provided docker-compose.yml:
```bash
docker-compose up -d
```

2. Environment variables for services are in `docker-compose.yml`:
```yaml
environment:
  - DATABASE_URL=postgresql://postgres:password@postgres:5432/nktc_db
  - MONGODB_DATABASE_URL=mongodb://mongo:27017/nktc_mongo
  - JWT_SECRET=your-secret-key
```

3. For local `.env` overrides, create `docker-compose.override.yml`:
```yaml
version: '3.8'
services:
  backend:
    environment:
      - PORT=3001
      - JWT_SECRET=your-local-secret
```

---

## 🌍 Production Deployment

### Environment Variables for Deployment

Different platforms have different ways to manage secrets:

#### Vercel (Next.js Frontend)
1. Go to Project Settings → Environment Variables
2. Add variables for each environment:
   ```
   NEXT_PUBLIC_API_URL=https://api.nktc-stu.com
   NEXT_PUBLIC_EDUCATION_YEARS=2567
   ANALYZE=false
   ```

#### Docker / Self-Hosted
1. Set environment variables when running container:
```bash
docker run -e DATABASE_URL="..." -e JWT_SECRET="..." backend:latest
```

2. Or use `.env` file in production:
```bash
# Load from .env file (DO NOT commit this!)
docker run --env-file .env backend:latest
```

#### CI/CD (GitHub Actions)
1. Go to Settings → Secrets and Variables → Actions
2. Add secrets (automatically encrypted):
   ```
   DATABASE_URL
   JWT_SECRET
   RT_SECRET
   MONGODB_DATABASE_URL
   MINIO_ACCESS_KEY
   MINIO_SECRET_KEY
   ```
3. Reference in workflow:
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

---

## 📚 Complete Variable Reference

### Frontend Variables

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:3001` | Backend API URL (must start with `NEXT_PUBLIC_` to be accessible in browser) |
| `NEXT_PUBLIC_EDUCATION_YEARS` | ✅ | `2567` | Thai education year |
| `ANALYZE` | ❌ | `false` | Bundle analysis (true for analysis, false for normal build) |

### Backend Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `NODE_ENV` | ✅ | `development` | `development`, `test`, or `production` |
| `PORT` | ✅ | `3001` | Server port |
| `APP_NAME` | ❌ | `NKTC Backend API` | Application name |
| `HOST` | ❌ | `localhost` | Server host |
| `HOST_URL` | ✅ | `http://localhost:3001` | Full server URL |
| `DATABASE_URL` | ✅ | - | PostgreSQL connection string |
| `MONGODB_DATABASE_URL` | ❌ | - | MongoDB connection string (optional) |
| `JWT_SECRET` | ✅ | - | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | ✅ | `30m` | JWT token expiration |
| `RT_SECRET` | ✅ | - | Refresh token secret (min 64 chars) |
| `MINIO_ENDPOINT` | ❌ | `localhost` | MinIO server endpoint |
| `MINIO_PORT` | ❌ | `9000` | MinIO server port |
| `MINIO_ACCESS_KEY` | ❌ | - | MinIO access key |
| `MINIO_SECRET_KEY` | ❌ | - | MinIO secret key |
| `MINIO_USE_SSL` | ❌ | `false` | Use SSL for MinIO connection |
| `MINIO_BUCKET_NAME` | ❌ | `nktc-app` | MinIO bucket name |
| `MINIO_ROOT_USER` | ❌ | - | MinIO root username (container setup) |
| `MINIO_ROOT_PASSWORD` | ❌ | - | MinIO root password (container setup) |
| `USER_ADMIN` | ❌ | `admin` | Default admin username |
| `USER_PASSWORD` | ❌ | `password` | Default admin password |
| `POSTGRES_DB` | ❌ | `edu` | PostgreSQL database name |
| `POSTGRES_USER` | ❌ | `postgres` | PostgreSQL user |
| `POSTGRES_PASSWORD` | ❌ | - | PostgreSQL password |
| `EDUCATION_YEARS` | ✅ | `2567` | Thai education year |

---

## 🔐 Security Best Practices

### ✅ DO
- ✅ Copy from `.env.example` to `.env.local`
- ✅ Use `.gitignore` to prevent committing `.env` files
- ✅ Use strong, unique secrets (min 32 chars for JWT)
- ✅ Rotate credentials regularly
- ✅ Use environment-specific secrets for each deployment
- ✅ Store secrets in secure vaults (not in code)
- ✅ Use GitHub Secrets for CI/CD pipelines

### ❌ DON'T
- ❌ Commit any `.env` files to git
- ❌ Share credentials via Slack/Email
- ❌ Use same credentials across environments
- ❌ Use weak or default passwords
- ❌ Hardcode secrets in source code
- ❌ Store credentials in comments
- ❌ Commit `.env.local` or development credentials

---

## 🚨 If Credentials Are Exposed

**IMMEDIATE ACTIONS** (Within 1 hour):

1. **Stop Using Exposed Credentials**:
   - Rotate all exposed secrets immediately
   - Generate new JWT_SECRET, RT_SECRET
   - Update database passwords
   - Regenerate MinIO access keys

2. **Notify Your Team**:
   - Alert all developers
   - Notify DevOps/Infrastructure team
   - Document what was exposed

3. **Update All Systems**:
   - Update backend/.env
   - Update deployment configurations
   - Update CI/CD secrets
   - Update database access
   - Update MinIO access

4. **Audit & Monitor**:
   - Check server logs for suspicious access
   - Monitor for unauthorized API calls
   - Review database access logs

See `SECURITY_REMEDIATION.md` for detailed procedures.

---

## 📝 Troubleshooting

### Issue: "Cannot find module .env"
**Solution**: Create the `.env.local` file with required variables

### Issue: Environment variables not loading
**Solution**: Make sure variables are in the correct file:
- Frontend: Use `NEXT_PUBLIC_` prefix for browser access
- Backend: No prefix needed, but must be in `.env`
- Docker: Check `docker-compose.yml` or use `--env-file`

### Issue: "Database connection refused"
**Solution**: Check DATABASE_URL:
- Verify PostgreSQL is running
- Verify hostname/IP is correct
- Verify port (default 5432)
- Verify username and password

### Issue: "MinIO connection failed"
**Solution**: Check MinIO configuration:
- Verify MINIO_ENDPOINT and MINIO_PORT
- Verify access key and secret key
- Verify MINIO_USE_SSL setting
- Check if MinIO service is running

---

## 🔄 Regenerating Secrets

### Generate new JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# or
openssl rand -base64 32
```

### Generate new RT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
# or
openssl rand -base64 64
```

### Generate PostgreSQL password
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Generate MinIO keys
```bash
# Access Key (20 chars)
node -e "console.log(require('crypto').randomBytes(10).toString('hex').toUpperCase())"

# Secret Key (40 chars)
node -e "console.log(require('crypto').randomBytes(20).toString('hex').toUpperCase())"
```

---

## 📞 Help & Support

If you encounter issues with environment setup:

1. Check this guide and `.env.example` files
2. Verify all required variables are present
3. Check file permissions (`.env` should be readable)
4. Verify services are running (PostgreSQL, MongoDB, MinIO)
5. Check application logs for error messages
6. Ask team lead or DevOps engineer

---

**Last Updated**: 2025-10-23
**Version**: 1.0
