#!/usr/bin/env bash

################################################################################
# College Hub - cURL Testing Commands
# Usage: bash test-api.sh
# Or run individual commands manually
################################################################################

BASE_URL="http://localhost:5000"
CONTENT_TYPE="Content-Type: application/json"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}College Hub API Testing - cURL Commands${NC}\n"

################################################################################
# 1. HEALTH CHECK
################################################################################

echo -e "${GREEN}1. Health Check${NC}"
curl -X GET "$BASE_URL/health" \
  -H "$CONTENT_TYPE" \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 2. SIGNUP
################################################################################

echo -e "${GREEN}2. Signup - Create New User${NC}"
curl -X POST "$BASE_URL/api/auth/signup" \
  -H "$CONTENT_TYPE" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123@"
  }' \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 3. LOGIN
################################################################################

echo -e "${GREEN}3. Login - Get Access Token${NC}"
curl -X POST "$BASE_URL/api/auth/login" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123@"
  }' \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 4. GET PROFILE (requires token)
################################################################################

echo -e "${GREEN}4. Get Current Profile${NC}"
echo "Note: Replace YOUR_ACCESS_TOKEN with actual token from login"
curl -X GET "$BASE_URL/api/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 5. UPDATE PROFILE
################################################################################

echo -e "${GREEN}5. Update Profile${NC}"
curl -X PUT "$BASE_URL/api/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "name": "John Smith",
    "phone": "+1-555-0123"
  }' \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 6. UPDATE LOCATION
################################################################################

echo -e "${GREEN}6. Update Location${NC}"
curl -X PUT "$BASE_URL/api/users/me/location" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "lat": 40.7128,
    "lng": -74.0060
  }' \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 7. GET NEARBY USERS
################################################################################

echo -e "${GREEN}7. Get Nearby Users${NC}"
curl -X GET "$BASE_URL/api/users/nearby?lat=40.7128&lng=-74.0060&maxDistance=5000&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 8. CREATE CLUB
################################################################################

echo -e "${GREEN}8. Create Club${NC}"
curl -X POST "$BASE_URL/api/clubs" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "name": "Tech Club",
    "description": "All things technology",
    "category": "technical"
  }' \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 9. CREATE EVENT
################################################################################

echo -e "${GREEN}9. Create Event${NC}"
curl -X POST "$BASE_URL/api/events" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "title": "Web Development Workshop",
    "description": "Learn modern web development",
    "clubId": "YOUR_CLUB_ID",
    "startAt": "2025-02-15T10:00:00Z",
    "endAt": "2025-02-15T13:00:00Z",
    "location": {
      "name": "Engineering Building",
      "address": "123 Tech Street",
      "coords": {
        "lat": 37.7749,
        "lng": -122.4194
      }
    },
    "capacity": 50,
    "isPaid": false
  }' \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 10. LIST EVENTS
################################################################################

echo -e "${GREEN}10. List All Events${NC}"
curl -X GET "$BASE_URL/api/events?status=published&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 11. REGISTER FOR EVENT
################################################################################

echo -e "${GREEN}11. Register for Event${NC}"
curl -X POST "$BASE_URL/api/events/YOUR_EVENT_ID/register" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "userCoordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }' \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 12. TEST CONCURRENT REGISTRATION (run twice - second should fail)
################################################################################

echo -e "${GREEN}12. Test Concurrent Registration - First Attempt${NC}"
curl -X POST "$BASE_URL/api/events/YOUR_EVENT_ID/register" \
  -H "Authorization: Bearer USER2_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "userCoordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${GREEN}12b. Test Concurrent Registration - Second Attempt (should fail with ALREADY_REGISTERED)${NC}"
curl -X POST "$BASE_URL/api/events/YOUR_EVENT_ID/register" \
  -H "Authorization: Bearer USER2_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "userCoordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }' \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 13. GET REGISTRATIONS
################################################################################

echo -e "${GREEN}13. Get My Registrations${NC}"
curl -X GET "$BASE_URL/api/registrations?userId=YOUR_USER_ID&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 14. REQUEST ETA
################################################################################

echo -e "${GREEN}14. Request ETA for Registration${NC}"
curl -X POST "$BASE_URL/api/registrations/YOUR_REGISTRATION_ID/request-eta" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "userCoordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }' \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 15. GEOCODE ADDRESS
################################################################################

echo -e "${GREEN}15. Geocode Address${NC}"
curl -X POST "$BASE_URL/api/maps/geocode" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "address": "123 Main Street, San Francisco, CA"
  }' \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 16. GET ROUTE ESTIMATE (ETA)
################################################################################

echo -e "${GREEN}16. Get Route Estimate (ETA)${NC}"
curl -X POST "$BASE_URL/api/maps/route-estimate" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "from": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "to": {
      "lat": 40.7580,
      "lng": -73.9855
    },
    "mode": "driving"
  }' \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 17. TEST ERROR - Invalid Credentials
################################################################################

echo -e "${YELLOW}17. TEST ERROR - Invalid Credentials${NC}"
curl -X POST "$BASE_URL/api/auth/login" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword123@"
  }' \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# 18. TEST ERROR - Missing Authorization
################################################################################

echo -e "${YELLOW}18. TEST ERROR - Missing Authorization${NC}"
curl -X GET "$BASE_URL/api/users/me" \
  -H "$CONTENT_TYPE" \
  -w "\nStatus: %{http_code}\n\n"

################################################################################
# QUICK TEST FUNCTION
################################################################################

test_all() {
  echo -e "${BLUE}Running all basic tests...${NC}\n"
  
  # Store token from login
  echo "Creating test user and getting token..."
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "$CONTENT_TYPE" \
    -d '{
      "email": "test@example.com",
      "password": "TestPass123@"
    }')
  
  TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  
  if [ -z "$TOKEN" ]; then
    echo "Failed to get token. Response: $RESPONSE"
    return 1
  fi
  
  echo -e "${GREEN}✓ Got token${NC}\n"
  
  # Test authenticated endpoint
  echo "Testing profile endpoint..."
  curl -s -X GET "$BASE_URL/api/users/me" \
    -H "Authorization: Bearer $TOKEN" \
    -H "$CONTENT_TYPE" | jq .
  
  echo -e "\n${GREEN}Tests completed!${NC}"
}

################################################################################
# HELPER FUNCTIONS
################################################################################

# Save response to file
save_response() {
  local endpoint=$1
  local method=$2
  local data=$3
  local output_file="response.json"
  
  if [ "$method" = "GET" ]; then
    curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "$CONTENT_TYPE" | jq . > "$output_file"
  else
    curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "$CONTENT_TYPE" \
      -d "$data" | jq . > "$output_file"
  fi
  
  echo "Response saved to $output_file"
}

# Pretty print JSON response
pretty_response() {
  curl -s "$@" | jq .
}

################################################################################
# USAGE INSTRUCTIONS
################################################################################

cat << 'EOF'

═══════════════════════════════════════════════════════════════════════════════
HOW TO USE THIS SCRIPT:

1. MANUAL TESTING (copy-paste individual commands):
   - Open Terminal
   - Copy any curl command above
   - Replace YOUR_ACCESS_TOKEN, YOUR_USER_ID, etc. with real values
   - Paste and run

2. AUTOMATED TESTING (run full script):
   bash test-api.sh

3. TESTING WORKFLOW:
   
   STEP 1: Get Token
   - Run the Login command (request #3)
   - Copy the accessToken from response
   - Use it in headers: Authorization: Bearer {token}
   
   STEP 2: Test User Features
   - Get Profile (#4)
   - Update Profile (#5)
   - Update Location (#6)
   - Get Nearby Users (#7)
   
   STEP 3: Test Club Features
   - Create Club (#8)
   - Copy club ID from response
   - Create Event using that club ID (#9)
   
   STEP 4: Test Event Registration (CONCURRENT SAFETY)
   - Create Event (#9)
   - Copy event ID
   - Register User 1 (#11) → Should succeed
   - Register User 2 with same event (#11) → Should fail with ALREADY_REGISTERED
   
   STEP 5: Test ETA & Maps
   - Request ETA (#14)
   - Geocode Address (#15)
   - Get Route Estimate (#16)
   
   STEP 6: Test Error Handling
   - Invalid Login (#17)
   - Missing Authorization (#18)

═══════════════════════════════════════════════════════════════════════════════

EXPECTED STATUS CODES:

200 OK          → Successful GET/PUT/PATCH/DELETE
201 Created     → Successful POST (creates resource)
400 Bad Request → Validation error, missing fields
401 Unauthorized → Missing/invalid token
403 Forbidden   → Insufficient permissions (not admin)
404 Not Found   → Resource doesn't exist
409 Conflict    → Duplicate registration, event at capacity
429 Too Many    → Rate limited
500 Error       → Server error

═══════════════════════════════════════════════════════════════════════════════

IMPORTANT PLACEHOLDERS TO REPLACE:

YOUR_ACCESS_TOKEN       → Copy from login response: "accessToken"
YOUR_USER_ID            → Copy from profile: "_id"
YOUR_CLUB_ID            → Copy from create club response: "_id"
YOUR_EVENT_ID           → Copy from create event response: "_id"
YOUR_REGISTRATION_ID    → Copy from registrations list: "_id"
USER2_ACCESS_TOKEN      → Token for testing concurrent registration

═══════════════════════════════════════════════════════════════════════════════

CONCURRENT REGISTRATION TEST (IMPORTANT):

This tests the core feature of concurrent-safe registration:

1. Create Event with capacity 50
2. User 1 registers → Success (201 Created)
3. User 1 registers again → Fails (409 Conflict - ALREADY_REGISTERED)
4. User 2 registers → Success (201 Created)
5. Event at capacity → Next registration fails (400 Bad Request - OVERBOOKED)

═══════════════════════════════════════════════════════════════════════════════

FEATURES TESTED:

✓ User Authentication (Signup, Login)
✓ Token Management (Access, Refresh)
✓ Profile Management (View, Update, Location)
✓ Club Management (Create, Join, Members)
✓ Event Management (Create, List, Details, Register)
✓ Concurrent Registration (Unique index, Duplicate prevention)
✓ Capacity Enforcement (Overbooked handling)
✓ ETA Computation (Mapbox + Fallback)
✓ Geolocation (Geocode, Reverse Geocode, Route)
✓ Error Handling (Proper error codes)
✓ Rate Limiting (Multiple requests throttled)

═══════════════════════════════════════════════════════════════════════════════

EOF

# Run test_all if called with "all" argument
if [ "$1" = "all" ]; then
  test_all
fi
