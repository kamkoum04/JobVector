#!/bin/bash

# Quick test script to debug authentication issues
BASE_URL="http://localhost:8080"

echo "🔍 Testing Authentication Flow..."

# Test 1: Register a test user
echo "1. Testing user registration..."
register_response=$(curl -s -o /tmp/test_register -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test_debug@test.com",
        "password": "123456",
        "nom": "Test",
        "prenom": "Debug",
        "cin": "99999999",
        "role": "CANDIDATE"
    }' \
    "$BASE_URL/auth/register")

echo "Registration response code: $register_response"
if [ "$register_response" != "200" ] && [ "$register_response" != "201" ]; then
    echo "Registration failed or user already exists:"
    cat /tmp/test_register
fi

# Test 2: Login and get token
echo "2. Testing login..."
login_response=$(curl -s -o /tmp/test_login -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test_debug@test.com",
        "password": "123456"
    }' \
    "$BASE_URL/auth/login")

echo "Login response code: $login_response"
if [ "$login_response" = "200" ]; then
    echo "Login successful! Response:"
    cat /tmp/test_login
    echo ""
    
    # Extract token
    token=$(cat /tmp/test_login | jq -r '.token' 2>/dev/null)
    if [ "$token" = "null" ] || [ -z "$token" ]; then
        token=$(cat /tmp/test_login | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    fi
    
    if [ ! -z "$token" ] && [ "$token" != "null" ]; then
        echo "✅ Token extracted successfully: ${token:0:20}..."
        echo "Token length: ${#token}"
        
        # Test 3: Test CV upload endpoint with this token
        echo "3. Testing CV upload endpoint access..."
        
        # Create a dummy small text file to test upload
        echo "This is a test CV content" > /tmp/test_cv.txt
        
        upload_response=$(curl -s -o /tmp/test_upload -w "%{http_code}" \
            -X POST \
            -H "Authorization: Bearer $token" \
            -F "cv=@/tmp/test_cv.txt" \
            "$BASE_URL/api/candidate/cv/upload")
        
        echo "CV upload response code: $upload_response"
        echo "CV upload response:"
        cat /tmp/test_upload
        
        # Clean up test file
        rm -f /tmp/test_cv.txt
        
    else
        echo "❌ Failed to extract token"
    fi
else
    echo "❌ Login failed:"
    cat /tmp/test_login
fi

# Clean up
rm -f /tmp/test_register /tmp/test_login /tmp/test_upload

echo "🔍 Authentication test completed!"
