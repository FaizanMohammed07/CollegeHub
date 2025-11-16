# Backend Setup Guide

## Prerequisites

- Node.js 16+
- MongoDB 5.0+
- npm or yarn
- Mapbox API key (optional, fallback available)

## Installation Steps

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/college-hub
MONGODB_TEST_URI=mongodb://localhost:27017/college-hub-test

# JWT Secrets (Use strong random strings in production)
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_RESET_PASSWORD_SECRET=your-super-secret-reset-key-change-in-production
JWT_VERIFICATION_SECRET=your-super-secret-verification-key-change-in-production
JWT_QR_TOKEN_SECRET=your-super-secret-qr-key-change-in-production

# Token Expiry
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_RESET_PASSWORD_EXPIRY=1h
JWT_VERIFICATION_EXPIRY=24h
JWT_QR_TOKEN_EXPIRY=1h

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Maps
MAPBOX_API_KEY=your-mapbox-api-key-optional
MAPBOX_TIMEOUT=5000

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@collegehub.com

# Logging
LOG_LEVEL=debug

# App
APP_NAME=College Hub
APP_VERSION=1.0.0
```

### 3. Start MongoDB

If using MongoDB locally:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Windows
mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed Database (Optional)

Load sample data:

```bash
npm run seed
```

This creates:

- 3 colleges (Stanford, MIT, UC Berkeley)
- 5 users with different roles
- 4 clubs
- 4 events
- 3 registrations

### 5. Run Server

**Development (with hot reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

**Run tests:**

```bash
npm test
npm run test:coverage
```

## Verification

Test the health endpoint:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is healthy"
}
```

View API documentation:

```bash
curl http://localhost:5000/api/docs
```

## Testing the API

### 1. Create an Account

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123@"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "Test User", "email": "test@example.com" },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123@"
  }'
```

### 3. Get Current User Profile

```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <access_token>"
```

### 4. Search Events

```bash
curl -X GET "http://localhost:5000/api/events?status=published&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

### 5. Register for Event

```bash
curl -X POST http://localhost:5000/api/events/<event_id>/register \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userCoordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }'
```

## Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

→ Ensure MongoDB is running. Check with `mongosh` or `mongo`

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

→ Change PORT in .env or kill the process using port 5000

### JWT Secret Errors

→ Ensure all JWT\_\*\_SECRET values are set in .env

### Database Seeding Fails

→ Ensure MongoDB is running and MONGODB_URI is correct

### Tests Fail

→ Ensure MONGODB_TEST_URI points to a test database

## Project Structure Quick Reference

```
src/
├── config/              # Configuration files
│   └── database.js      # MongoDB connection
├── schemas/             # Mongoose schemas
│   ├── User.js
│   ├── College.js
│   ├── Club.js
│   ├── Event.js
│   ├── Registration.js
│   └── ...
├── repositories/        # Data access layer
│   ├── userRepository.js
│   ├── clubRepository.js
│   ├── eventRepository.js
│   └── ...
├── services/            # Business logic
│   ├── authService.js
│   ├── userService.js
│   ├── clubService.js
│   ├── eventService.js
│   ├── registrationService.js
│   ├── mapService.js
│   └── revocationService.js
├── controllers/         # Route handlers
│   ├── authController.js
│   ├── userController.js
│   ├── clubController.js
│   ├── eventController.js
│   ├── registrationController.js
│   └── mapsController.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── clubRoutes.js
│   ├── eventRoutes.js
│   ├── registrationRoutes.js
│   └── mapsRoutes.js
├── middleware/          # Express middleware
│   ├── security.js      # CORS, Helmet, rate limiting
│   ├── auth.js          # JWT authentication
│   ├── validation.js    # Input validation
│   └── errorHandler.js  # Error handling
├── utils/               # Utility functions
│   ├── AppError.js      # Custom error class
│   ├── logger.js        # Structured logging
│   ├── jwt.js           # JWT utilities
│   ├── security.js      # Password hashing
│   └── asyncHandler.js  # Async wrapper
└── index.js             # App entry point
```

## Available npm Scripts

```bash
npm start           # Run production server
npm run dev         # Run with hot reload
npm test            # Run all tests
npm run test:unit   # Run unit tests only
npm run test:int    # Run integration tests only
npm run test:coverage # Generate coverage report
npm run seed        # Seed database with sample data
npm run lint        # Run ESLint (if configured)
npm run format      # Format code with Prettier (if configured)
```

## Architecture Overview

```
HTTP Request
    ↓
Routes (Define endpoints)
    ↓
Middleware (Security, Auth, Validation)
    ↓
Controllers (Thin request handlers)
    ↓
Services (Business logic)
    ↓
Repositories (Data access)
    ↓
Schemas (Data models)
    ↓
MongoDB Database
```

## Key Features Implemented

✅ JWT Authentication with token rotation  
✅ Role-based access control (RBAC)  
✅ Rate limiting  
✅ Structured logging  
✅ Concurrent registration safety with unique indexes  
✅ ETA computation with fallback  
✅ Geospatial queries  
✅ Comprehensive error handling  
✅ Input validation  
✅ Security headers (Helmet, CORS)  
✅ Password hashing (bcryptjs)  
✅ Token revocation system

## Next Steps

1. ✅ Backend is complete and ready to run
2. → Frontend scaffolding (React/Next.js)
3. → Integration testing with real data
4. → Deployment (AWS/Heroku/Railway)
5. → Production monitoring and logging
6. → API documentation (Swagger/OpenAPI)

## Support

For issues or questions:

1. Check this guide's troubleshooting section
2. Review logs in development mode (`npm run dev`)
3. Check MongoDB connection
4. Verify all environment variables are set
5. Review test files for usage examples

---

**Happy building! 🚀**
