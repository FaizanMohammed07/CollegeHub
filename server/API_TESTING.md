/\*\*

- API Testing Guide - Postman/cURL examples
- Import this collection into Postman or use with cURL
  \*/

// 1. AUTHENTICATION ENDPOINTS

// Signup
POST /api/auth/signup
Content-Type: application/json

{
"name": "John Doe",
"email": "john@example.com",
"password": "SecurePass123@"
}

Response: 201 Created
{
"success": true,
"data": {
"user": {
"\_id": "user123",
"name": "John Doe",
"email": "john@example.com"
},
"tokens": {
"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
}
}

---

// Login
POST /api/auth/login
Content-Type: application/json

{
"email": "john@example.com",
"password": "SecurePass123@"
}

Response: 200 OK
{
"success": true,
"data": {
"user": { "\_id": "user123", "name": "John Doe", "email": "john@example.com" },
"tokens": { "accessToken": "...", "refreshToken": "..." }
}
}

---

// Refresh Token
POST /api/auth/refresh
Content-Type: application/json

{
"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response: 200 OK
{
"success": true,
"data": {
"tokens": {
"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
}
}

---

// Logout
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response: 200 OK
{
"success": true,
"message": "Logged out successfully"
}

---

// 2. USER ENDPOINTS

// Get Current Profile
GET /api/users/me
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": {
"\_id": "user123",
"name": "John Doe",
"email": "john@example.com",
"role": "student",
"collegeId": "college123"
}
}

---

// Update Profile
PUT /api/users/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
"name": "John Smith",
"phone": "+1-555-0123",
"profilePicUrl": "https://example.com/pic.jpg"
}

Response: 200 OK
{
"success": true,
"data": { "\_id": "user123", "name": "John Smith", ... }
}

---

// Update Location
PUT /api/users/me/location
Authorization: Bearer <access_token>
Content-Type: application/json

{
"lat": 40.7128,
"lng": -74.0060
}

Response: 200 OK
{
"success": true,
"data": { "\_id": "user123", "location": { "type": "Point", "coordinates": [-74.0060, 40.7128] } }
}

---

// Get Nearby Users
GET /api/users/nearby?lat=40.7128&lng=-74.0060&maxDistance=5000&limit=10
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": [
{ "_id": "user456", "name": "Jane Doe", "distance": 1200 },
{ "_id": "user789", "name": "Bob Smith", "distance": 3400 }
]
}

---

// Search Users
GET /api/users/search?query=john&role=student&limit=10
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": [
{ "_id": "user123", "name": "John Doe", "email": "john@example.com" }
]
}

---

// 3. CLUB ENDPOINTS

// Create Club
POST /api/clubs
Authorization: Bearer <access_token>
Content-Type: application/json

{
"name": "Tech Club",
"description": "All things tech",
"category": "technical",
"logoUrl": "https://example.com/logo.jpg"
}

Response: 201 Created
{
"success": true,
"data": {
"\_id": "club123",
"name": "Tech Club",
"slug": "tech-club",
"membersCount": 1,
"admins": ["user123"]
}
}

---

// Get Club Details
GET /api/clubs/club123
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": {
"\_id": "club123",
"name": "Tech Club",
"description": "All things tech",
"members": ["user123", "user456"],
"admins": ["user123"]
}
}

---

// Update Club
PUT /api/clubs/club123
Authorization: Bearer <access_token>
Content-Type: application/json

{
"description": "Technology enthusiasts club",
"logoUrl": "https://example.com/new-logo.jpg"
}

Response: 200 OK
{
"success": true,
"data": { ... }
}

---

// Join Club
POST /api/clubs/club123/join
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": { "membersCount": 2 }
}

---

// Leave Club
POST /api/clubs/club123/leave
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"message": "Left club successfully"
}

---

// Get Club Members
GET /api/clubs/club123/members?limit=20&skip=0
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": [
{ "_id": "user123", "name": "John Doe" },
{ "_id": "user456", "name": "Jane Doe" }
]
}

---

// Add Admin
POST /api/clubs/club123/admins
Authorization: Bearer <access_token>
Content-Type: application/json

{
"userId": "user456"
}

Response: 200 OK
{
"success": true,
"message": "User promoted to admin"
}

---

// Remove Admin
DELETE /api/clubs/club123/admins/user456
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"message": "User removed from admins"
}

---

// Get College Clubs
GET /api/clubs/college/college123?verified=true&limit=10
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": [
{ "_id": "club123", "name": "Tech Club", "membersCount": 25 }
]
}

---

// Search Clubs
GET /api/clubs/search?query=tech&category=technical&limit=10
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": [
{ "_id": "club123", "name": "Tech Club", "verified": true }
]
}

---

// 4. EVENT ENDPOINTS

// Create Event
POST /api/events
Authorization: Bearer <access_token>
Content-Type: application/json

{
"title": "Web Dev Workshop",
"description": "Learn modern web development",
"startAt": "2024-02-15T10:00:00Z",
"endAt": "2024-02-15T13:00:00Z",
"location": {
"name": "Tech Building",
"address": "123 Tech Street",
"coords": {
"lat": 40.7128,
"lng": -74.0060
}
},
"capacity": 50,
"isPaid": false
}

Response: 201 Created
{
"success": true,
"data": {
"\_id": "event123",
"title": "Web Dev Workshop",
"status": "published",
"attendeesCount": 0,
"capacity": 50
}
}

---

// List Events (with filters)
GET /api/events?status=published&limit=10&skip=0&lat=40.7128&lng=-74.0060&maxDistance=10000&dateFrom=2024-02-01&dateTo=2024-02-28
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": [
{
"_id": "event123",
"title": "Web Dev Workshop",
"startAt": "2024-02-15T10:00:00Z",
"capacity": 50,
"attendeesCount": 5,
"distance": 1200
}
],
"pagination": { "total": 1, "limit": 10, "skip": 0 }
}

---

// Get Event Details
GET /api/events/event123
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": {
"\_id": "event123",
"title": "Web Dev Workshop",
"description": "Learn modern web development",
"capacity": 50,
"attendeesCount": 5,
"status": "published",
"location": { "name": "Tech Building", "coords": { "type": "Point", "coordinates": [-74.0060, 40.7128] } }
}
}

---

// Update Event
PUT /api/events/event123
Authorization: Bearer <access_token>
Content-Type: application/json

{
"title": "Advanced Web Dev Workshop",
"capacity": 60
}

Response: 200 OK
{
"success": true,
"data": { ... }
}

---

// Cancel Event
POST /api/events/event123/cancel
Authorization: Bearer <access_token>
Content-Type: application/json

{
"reason": "Venue unavailable"
}

Response: 200 OK
{
"success": true,
"data": { "status": "cancelled", "cancellationReason": "Venue unavailable" }
}

---

// Register for Event
POST /api/events/event123/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
"userCoordinates": {
"lat": 40.7128,
"lng": -74.0060
}
}

Response: 201 Created
{
"success": true,
"data": {
"\_id": "reg123",
"eventId": "event123",
"userId": "user123",
"status": "registered",
"eta": {
"etaSeconds": 1800,
"distanceMeters": 2000,
"provider": "mapbox",
"reliabilityScore": 0.85
}
}
}

---

// Get Event Registrations (Admin)
GET /api/events/event123/registrations?limit=20&skip=0
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": [
{
"_id": "reg123",
"userId": "user123",
"status": "registered"
}
]
}

---

// Check-in User
POST /api/events/event123/checkin
Authorization: Bearer <access_token>
Content-Type: application/json

{
"registrationId": "reg123"
}

Response: 200 OK
{
"success": true,
"data": {
"\_id": "reg123",
"status": "checked-in",
"checkedInAt": "2024-02-15T10:05:00Z"
}
}

---

// Search Events
GET /api/events/search?query=workshop&category=technical&limit=10
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": [
{ "_id": "event123", "title": "Web Dev Workshop" }
]
}

---

// 5. REGISTRATION ENDPOINTS

// Get Registrations
GET /api/registrations?userId=user123&limit=10
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": [
{
"_id": "reg123",
"eventId": "event123",
"status": "registered",
"event": { "title": "Web Dev Workshop" }
}
]
}

---

// Update Registration Status (Admin)
PATCH /api/registrations/reg123/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
"status": "checked-in",
"metadata": {}
}

Response: 200 OK
{
"success": true,
"data": { "\_id": "reg123", "status": "checked-in" }
}

---

// Cancel Registration
POST /api/registrations/reg123/cancel
Authorization: Bearer <access_token>
Content-Type: application/json

{
"reason": "Can't attend"
}

Response: 200 OK
{
"success": true,
"data": { "\_id": "reg123", "status": "cancelled" }
}

---

// Request ETA
POST /api/registrations/reg123/request-eta
Authorization: Bearer <access_token>
Content-Type: application/json

{
"userCoordinates": {
"lat": 40.7128,
"lng": -74.0060
}
}

Response: 200 OK
{
"success": true,
"data": {
"eta": {
"etaSeconds": 1800,
"distanceMeters": 2000,
"polyline": "encoded_polyline",
"reliabilityScore": 0.85,
"provider": "mapbox"
}
}
}

---

// Generate QR Token (Admin)
POST /api/registrations/reg123/qr-token
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": {
"qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
}

---

// 6. MAPS ENDPOINTS

// Geocode Address
POST /api/maps/geocode
Authorization: Bearer <access_token>
Content-Type: application/json

{
"address": "123 Main Street, San Francisco, CA"
}

Response: 200 OK
{
"success": true,
"data": {
"lat": 37.7749,
"lng": -122.4194,
"formattedAddress": "123 Main St, San Francisco, CA 94102, USA",
"confidence": 0.95
}
}

---

// Reverse Geocode
POST /api/maps/reverse-geocode
Authorization: Bearer <access_token>
Content-Type: application/json

{
"lat": 37.7749,
"lng": -122.4194
}

Response: 200 OK
{
"success": true,
"data": {
"formattedAddress": "123 Main St, San Francisco, CA 94102, USA"
}
}

---

// Get Route Estimate
POST /api/maps/route-estimate
Authorization: Bearer <access_token>
Content-Type: application/json

{
"from": {
"lat": 40.7128,
"lng": -74.0060
},
"to": {
"lat": 40.7580,
"lng": -73.9855
},
"mode": "driving"
}

Response: 200 OK
{
"success": true,
"data": {
"etaSeconds": 900,
"distanceMeters": 2000,
"polyline": "encoded_polyline",
"reliabilityScore": 0.85,
"provider": "mapbox",
"providerMeta": {}
}
}

---

// Get Cache Stats
GET /api/maps/cache-stats
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"data": {
"totalCached": 42,
"cacheHits": 128,
"cacheMisses": 15
}
}

---

// Clear Cache (Admin)
POST /api/maps/cache/clear
Authorization: Bearer <access_token>

Response: 200 OK
{
"success": true,
"message": "Cache cleared successfully"
}

---

// ERROR RESPONSE EXAMPLES

// 401 Unauthorized
{
"success": false,
"error": {
"code": "UNAUTHORIZED",
"message": "Missing or invalid authorization token"
}
}

// 403 Forbidden
{
"success": false,
"error": {
"code": "INSUFFICIENT_ROLE",
"message": "You don't have permission to perform this action"
}
}

// 409 Conflict (Already Registered)
{
"success": false,
"error": {
"code": "ALREADY_REGISTERED",
"message": "You are already registered for this event"
}
}

// 400 Overbooked
{
"success": false,
"error": {
"code": "OVERBOOKED",
"message": "This event has reached capacity"
}
}

// 429 Rate Limited
{
"success": false,
"error": {
"code": "RATE_LIMITED",
"message": "Too many requests. Please try again later."
}
}

// 500 Internal Server Error
{
"success": false,
"error": {
"code": "INTERNAL_SERVER_ERROR",
"message": "An unexpected error occurred. Please try again later."
}
}
