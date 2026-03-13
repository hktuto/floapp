#!/bin/bash
set -e

BASE_URL="http://localhost:3000/api"

echo "=== Testing API Endpoints ==="
echo ""

# Test 1: Register
echo "1. POST /auth/register - Register new user"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"type":"username","identifier":"testuser","password":"password123"}')
echo "Response: $REGISTER_RESPONSE"
echo ""

# Test 2: Login
echo "2. POST /auth/login - Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"type":"username","identifier":"testuser","password":"password123"}')
echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract cookie from login (if successful)
COOKIE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"type":"username","identifier":"testuser","password":"password123"}' \
  -c - 2>/dev/null | grep session | awk '{print $7}')

if [ -n "$COOKIE" ]; then
  echo "Session cookie received"
else
  echo "No session cookie (login might have failed)"
fi
echo ""

# Test 3: Get current user (should fail without auth)
echo "3. GET /auth/me - Get current user (no auth)"
curl -s "$BASE_URL/auth/me"
echo ""
echo ""

# Test 4: Get profile (should fail without auth)
echo "4. GET /profile - Get profile (no auth)"
curl -s "$BASE_URL/profile"
echo ""
echo ""

# Test 5: Get measurements (should fail without auth)
echo "5. GET /measurements - Get measurements (no auth)"
curl -s "$BASE_URL/measurements"
echo ""
echo ""

# Test 6: Get targets (should fail without auth)
echo "6. GET /targets - Get targets (no auth)"
curl -s "$BASE_URL/targets"
echo ""
echo ""

echo "=== API Test Complete ==="
