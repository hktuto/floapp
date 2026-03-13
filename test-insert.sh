#!/bin/bash
BASE_URL="http://localhost:3000/api"

echo "=== Testing INSERT with sean ==="

# Login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"type":"username","identifier":"sean","password":"password123"}' \
  -c /tmp/cookies.txt)
echo "Login: $LOGIN_RESPONSE"
echo ""

# Test POST /measurements
echo "POST /measurements (with numbers)"
curl -s -X POST "$BASE_URL/measurements" \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"recordedAt":"2025-03-13","weightKg":70.5,"bodyFatPct":18.5,"note":"Test"}'
echo ""
echo ""

# Test POST /targets
echo "POST /targets (with numbers)"
curl -s -X POST "$BASE_URL/targets" \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"targetType":"weight","targetValue":65,"targetDate":"2025-06-13"}'
echo ""

