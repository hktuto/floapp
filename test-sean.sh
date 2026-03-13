#!/bin/bash
BASE_URL="http://localhost:3000/api"

echo "=== Testing with seeded user 'sean' ==="
echo ""

# Login with sean / password123
echo "1. POST /auth/login - Login as sean"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"type":"username","identifier":"sean","password":"password123"}' \
  -c /tmp/cookies.txt)
echo "Response: $LOGIN_RESPONSE"
echo ""

if echo "$LOGIN_RESPONSE" | grep -q "success.*true"; then
  echo "✅ Login successful!"
  echo ""
  
  echo "2. GET /auth/me - Get current user"
  ME_RESPONSE=$(curl -s "$BASE_URL/auth/me" -b /tmp/cookies.txt)
  echo "Response: $ME_RESPONSE"
  echo ""
  
  echo "3. GET /profile - Get profile"
  PROFILE_RESPONSE=$(curl -s "$BASE_URL/profile" -b /tmp/cookies.txt)
  echo "Response: $PROFILE_RESPONSE"
  echo ""
  
  echo "4. GET /measurements - Get measurements"
  MEASUREMENTS_RESPONSE=$(curl -s "$BASE_URL/measurements" -b /tmp/cookies.txt)
  echo "Response (first 300 chars): ${MEASUREMENTS_RESPONSE:0:300}"
  echo ""
  
  echo "5. GET /targets - Get targets"
  TARGETS_RESPONSE=$(curl -s "$BASE_URL/targets" -b /tmp/cookies.txt)
  echo "Response: $TARGETS_RESPONSE"
  echo ""
  
  echo "6. POST /measurements - Create new record"
  NEW_RECORD=$(curl -s -X POST "$BASE_URL/measurements" \
    -H "Content-Type: application/json" \
    -b /tmp/cookies.txt \
    -d '{"recordedAt":"2025-03-13","weightKg":70.5,"bodyFatPct":18.5,"muscleKg":32.5,"waistCm":79.0,"note":"API Test"}')
  echo "Response: $NEW_RECORD"
  echo ""
  
  echo "7. POST /targets - Create new target"
  NEW_TARGET=$(curl -s -X POST "$BASE_URL/targets" \
    -H "Content-Type: application/json" \
    -b /tmp/cookies.txt \
    -d '{"targetType":"weight","targetValue":65,"targetDate":"2025-06-13"}')
  echo "Response: $NEW_TARGET"
  echo ""
  
  echo "8. PUT /profile - Update profile"
  UPDATE_PROFILE=$(curl -s -X PUT "$BASE_URL/profile" \
    -H "Content-Type: application/json" \
    -b /tmp/cookies.txt \
    -d '{"firstName":"Sean","lastName":"Ts","heightCm":175}')
  echo "Response: $UPDATE_PROFILE"
  echo ""
  
  echo "9. POST /auth/logout - Logout"
  LOGOUT=$(curl -s -X POST "$BASE_URL/auth/logout" -b /tmp/cookies.txt)
  echo "Response: $LOGOUT"
  echo ""
  
  echo "=== All API Tests Complete ==="
  
else
  echo "❌ Login failed"
fi
