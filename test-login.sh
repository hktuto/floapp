#!/bin/bash
BASE_URL="http://localhost:3000/api"

echo "=== Testing with seeded user ==="
echo ""

# Try to find seeded users from seed endpoint info
echo "Testing login with seeded user 'alice'..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"type":"username","identifier":"alice","password":"password123"}' \
  -c /tmp/cookies.txt)
echo "Login Response: $LOGIN_RESPONSE"
echo ""

if echo "$LOGIN_RESPONSE" | grep -q "success"; then
  echo "✅ Login successful!"
  echo ""
  
  echo "Testing authenticated endpoints:"
  echo ""
  
  echo "1. GET /auth/me"
  curl -s "$BASE_URL/auth/me" -b /tmp/cookies.txt | head -c 200
  echo ""
  echo ""
  
  echo "2. GET /profile"
  curl -s "$BASE_URL/profile" -b /tmp/cookies.txt | head -c 200
  echo ""
  echo ""
  
  echo "3. GET /measurements"
  curl -s "$BASE_URL/measurements" -b /tmp/cookies.txt | head -c 200
  echo ""
  echo ""
  
  echo "4. GET /targets"
  curl -s "$BASE_URL/targets" -b /tmp/cookies.txt | head -c 200
  echo ""
  echo ""
  
  echo "5. POST /measurements - Create new record"
  curl -s -X POST "$BASE_URL/measurements" \
    -H "Content-Type: application/json" \
    -b /tmp/cookies.txt \
    -d '{"recordedAt":"2025-03-13","weightKg":70.5,"bodyFatPct":18.5,"note":"Test record"}'
  echo ""
  echo ""
  
  echo "6. POST /targets - Create new target"
  curl -s -X POST "$BASE_URL/targets" \
    -H "Content-Type: application/json" \
    -b /tmp/cookies.txt \
    -d '{"targetType":"weight","targetValue":65,"targetDate":"2025-06-13"}'
  echo ""
  echo ""
  
  echo "7. PUT /profile - Update profile"
  curl -s -X PUT "$BASE_URL/profile" \
    -H "Content-Type: application/json" \
    -b /tmp/cookies.txt \
    -d '{"firstName":"Test","lastName":"User","heightCm":175}'
  echo ""
  echo ""
  
  echo "8. POST /auth/logout"
  curl -s -X POST "$BASE_URL/auth/logout" -b /tmp/cookies.txt
  echo ""
  
else
  echo "❌ Login failed"
fi

