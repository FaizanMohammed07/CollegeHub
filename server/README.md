# College Hub - Backend API Documentation

## Overview

Production-grade MERN College Hub backend built with:

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (access + refresh tokens)
- **Architecture**: Layered (routes → controllers → services → repositories)

## Project Structure

```
server/
├── src/
│   ├── config/        # Database configuration
│   ├── schemas/       # Mongoose schemas
│   ├── controllers/   # Thin request handlers
│   ├── services/      # Business logic
│   ├── repositories/  # Database access layer
│   ├── middleware/    # Express middleware
│   ├── routes/        # API routes
│   ├── utils/         # Utility functions
│   └── index.js       # App entry point
├── tests/
│   ├── unit/          # Unit tests
│   └── integration/   # Integration tests
├── package.json
└── .env.example
```

## Quick Start

### Installation

```bash
cd server
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start

# Tests
npm test
npm run test:coverage
```

## API Endpoints

### Authentication

| Method | Endpoint                         | Description                |
| ------ | -------------------------------- | -------------------------- |
| POST   | `/api/auth/signup`               | Create account             |
| POST   | `/api/auth/login`                | Login user                 |
| POST   | `/api/auth/refresh`              | Refresh access token       |
| POST   | `/api/auth/logout`               | Logout user                |
| POST   | `/api/auth/forgot-password`      | Request password reset     |
| POST   | `/api/auth/reset-password`       | Reset password             |
| POST   | `/api/auth/request-verification` | Request email verification |
| POST   | `/api/auth/verify-email`         | Verify email               |

### Users

| Method | Endpoint                 | Description          |
| ------ | ------------------------ | -------------------- |
| GET    | `/api/users/me`          | Get current profile  |
| PUT    | `/api/users/me`          | Update profile       |
| PUT    | `/api/users/me/location` | Update location      |
| GET    | `/api/users/nearby`      | Find nearby users    |
| GET    | `/api/users/search`      | Search users         |
| GET    | `/api/users/:id`         | Get user by ID       |
| GET    | `/api/users/:id/stats`   | Get user statistics  |
| POST   | `/api/users/:id/block`   | Block user (admin)   |
| POST   | `/api/users/:id/unblock` | Unblock user (admin) |

### Clubs

| Method | Endpoint                        | Description       |
| ------ | ------------------------------- | ----------------- |
| POST   | `/api/clubs`                    | Create club       |
| GET    | `/api/clubs/:id`                | Get club details  |
| PUT    | `/api/clubs/:id`                | Update club       |
| POST   | `/api/clubs/:id/join`           | Join club         |
| POST   | `/api/clubs/:id/leave`          | Leave club        |
| GET    | `/api/clubs/:id/members`        | Get members       |
| POST   | `/api/clubs/:id/admins`         | Add admin         |
| DELETE | `/api/clubs/:id/admins/:userId` | Remove admin      |
| GET    | `/api/clubs/college/:collegeId` | Get college clubs |
| GET    | `/api/clubs/search`             | Search clubs      |

### Events

| Method | Endpoint                        | Description                |
| ------ | ------------------------------- | -------------------------- |
| POST   | `/api/events`                   | Create event               |
| GET    | `/api/events`                   | List events (with filters) |
| GET    | `/api/events/:id`               | Get event details          |
| PUT    | `/api/events/:id`               | Update event               |
| POST   | `/api/events/:id/cancel`        | Cancel event               |
| POST   | `/api/events/:id/register`      | Register for event         |
| GET    | `/api/events/:id/registrations` | Get registrations (admin)  |
| POST   | `/api/events/:id/checkin`       | Check in user              |

### Registrations

| Method | Endpoint                             | Description               |
| ------ | ------------------------------------ | ------------------------- |
| GET    | `/api/registrations`                 | Get registrations         |
| PATCH  | `/api/registrations/:id/status`      | Update status (admin)     |
| POST   | `/api/registrations/:id/cancel`      | Cancel registration       |
| POST   | `/api/registrations/:id/request-eta` | Request ETA               |
| POST   | `/api/registrations/:id/qr-token`    | Generate QR token (admin) |

### Maps

| Method | Endpoint                    | Description         |
| ------ | --------------------------- | ------------------- |
| POST   | `/api/maps/geocode`         | Geocode address     |
| POST   | `/api/maps/reverse-geocode` | Reverse geocode     |
| POST   | `/api/maps/route-estimate`  | Get route estimate  |
| GET    | `/api/maps/cache-stats`     | Cache statistics    |
| POST   | `/api/maps/cache/clear`     | Clear cache (admin) |

## Response Format

All responses follow consistent JSON envelope:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Error Codes

- `INVALID_CREDENTIALS` - Login failed
- `UNAUTHORIZED` - Missing/invalid auth
- `INSUFFICIENT_ROLE` - User lacks permissions
- `USER_NOT_FOUND` - User does not exist
- `RESOURCE_NOT_FOUND` - Resource not found
- `ALREADY_REGISTERED` - Already registered for event
- `OVERBOOKED` - Event at capacity
- `VALIDATION_ERROR` - Input validation failed
- `RATE_LIMITED` - Rate limit exceeded
- `INTERNAL_SERVER_ERROR` - Server error

## Authentication

### JWT Tokens

- **Access Token**: 15 minutes validity, sent in Authorization header
- **Refresh Token**: 7 days validity, stored in HTTP-only cookie
- **Token Rotation**: Refresh tokens are rotated on each refresh

### Headers

```
Authorization: Bearer <access_token>
```

### Cookies

```
Set-Cookie: accessToken=<token>; HttpOnly; Secure; SameSite=Strict
Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict
```

## Concurrency & Data Integrity

### Registration Safety

- **Unique Index**: `{eventId, userId}` prevents duplicates
- **Atomic Operations**: Capacity checks and attendee count increments are atomic
- **Capacity Enforcement**: Returns `OVERBOOKED` when full

### ETA Recomputation

Scheduling policy based on time-to-event:

- **>6 hours**: Recompute every 2 hours
- **1-6 hours**: Recompute every 15-30 minutes
- **<1 hour**: Recompute every 5 minutes

### Fallback Map Service

If primary provider (Mapbox) fails:

1. Returns fallback estimate using haversine formula
2. Sets reliability score lower (0.6 vs 0.85)
3. Uses average speeds for transportation modes

## Rate Limiting

- **Login**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP
- **General**: 100 requests per 15 minutes per IP

## Database Schemas

### User

- Strict validation on all fields
- Indexes: email (unique), role, isVerified, location (2dsphere)
- Pre-save hook: Hash password, validate strength
- Virtuals: initials

### Event

- Unique constraint: None (allows multiple events same details)
- Indexes: location (2dsphere), {clubId, startAt}
- Validation: startAt < endAt, startAt in future

### Registration

- Unique compound index: {eventId, userId}
- Indexes: {eventId, status}, {userId, status}
- Atomically safe registration with capacity checks

### Club

- Text index: name + description for search
- Soft delete: removed field

### College

- Geospatial queries: location as 2dsphere index

## Business Rules

### Events

1. **Time Validation**: startAt must be before endAt and in future
2. **Capacity Management**: Atomic increment on successful registration
3. **Concurrent Registration**: Handled by unique index + atomic operations
4. **Cancellation Policy**:
   - Sets status to 'cancelled'
   - Notifies attendees
   - Processes refunds for paid events

### Registrations

1. **Duplicate Prevention**: Unique index prevents duplicate registrations
2. **Capacity Enforcement**: OVERBOOKED error when full
3. **ETA Computation**: With fallback if provider fails
4. **Check-in**: QR code verification with signed tokens

## Security Features

- **HTTPS Enforced**: Checked in production
- **CORS**: Configurable with allowlist
- **Rate Limiting**: Per-IP and per-user
- **Input Validation**: Using express-validator
- **SQL Injection Protection**: Mongoose/MongoDB prevents
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Secure cookies with SameSite
- **Helmet**: Security headers
- **Bcrypt**: Password hashing (configurable rounds)
- **JWT**: Signed tokens with expiry

## Logging

Structured logging with Pino:

- Request ID tracking
- User ID tracking
- Route and latency
- Error stack traces
- Configurable log levels (debug, info, warn, error)

## Testing

### Unit Tests

```bash
npm test -- tests/unit/
```

### Integration Tests

```bash
npm test -- tests/integration/
```

### Coverage

```bash
npm run test:coverage
```

## Production Checklist

- [ ] Set strong JWT secrets in .env
- [ ] Configure MongoDB with proper authentication
- [ ] Enable HTTPS
- [ ] Set CORS origin to frontend domain
- [ ] Configure email service for verification/password reset
- [ ] Set up Redis for distributed token revocation (if needed)
- [ ] Configure Mapbox API key
- [ ] Set up monitoring and alerting
- [ ] Configure database backups
- [ ] Use environment-specific .env files

## Future Enhancements

1. **WebSocket Support**: Real-time event updates and tracking
2. **Job Queue**: Background jobs for ETA recomputation
3. **Redis Cache**: Distributed caching for map service
4. **Email Service**: Integration with SendGrid/AWS SES
5. **Payment Gateway**: Stripe/Razorpay integration
6. **Push Notifications**: FCM for event reminders
7. **Analytics**: Event and user analytics
8. **Admin Dashboard**: Analytics and moderation

## Support

For issues or questions, open an issue in the repository.
