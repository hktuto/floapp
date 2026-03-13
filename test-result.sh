#!/bin/bash
BASE_URL="http://localhost:3000/api"

echo "=== Testing Result Page Data ==="

# Login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"type":"username","identifier":"sean","password":"password123"}' \
  -c /tmp/cookies.txt)
echo "✅ Login"

# Get records (need 2 for comparison)
echo ""
echo "GET /measurements (should return 2+ records for comparison)"
RECORDS=$(curl -s "$BASE_URL/measurements?limit=2" -b /tmp/cookies.txt)
echo "Records count: $(echo $RECORDS | grep -o '"id"' | wc -l)"
echo "First record weight: $(echo $RECORDS | grep -o '"weight_kg":"[^"]*"' | head -1)"

# Get targets
echo ""
echo "GET /targets"
TARGETS=$(curl -s "$BASE_URL/targets" -b /tmp/cookies.txt)
echo "Active targets: $(echo $TARGETS | grep -o '"status":"active"' | wc -l)"

# Create new record (should redirect to result page in UI)
echo ""
echo "POST /measurements - Create new record"
NEW_RECORD=$(curl -s -X POST "$BASE_URL/measurements" \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"recordedAt":"2025-03-13","weightKg":69.5,"bodyFatPct":18.0,"note":"Result page test"}')
echo "Response: $NEW_RECORD"

echo ""
echo "=== Test Complete ==="
