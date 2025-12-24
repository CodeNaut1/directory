#!/bin/bash

# API Testing Script
# Tests all endpoints systematically
# Usage: ./test-api.sh or npm run test:api

set -e

BASE_URL="${BASE_URL:-http://localhost:3000/api}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Test result tracking
ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""
PROJECT_ID=""
CATEGORY_ID=""
COUNTRY_ID=""

echo "🧪 Starting API Tests..."
echo "Base URL: $BASE_URL"
echo ""

# Helper function to make requests
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth=$4
    local expected_status=${5:-200}
    local description=$6
    
    local url="$BASE_URL$endpoint"
    local cmd="curl -s -w '\n%{http_code}' -X $method"
    
    if [ ! -z "$data" ]; then
        cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    if [ ! -z "$auth" ]; then
        cmd="$cmd -H 'Authorization: Bearer $auth'"
    fi
    
    cmd="$cmd $url"
    
    response=$(eval $cmd)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} $description (HTTP $http_code)"
        ((PASSED++))
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        return 0
    else
        echo -e "${RED}✗${NC} $description (Expected $expected_status, got $http_code)"
        echo "$body"
        ((FAILED++))
        return 1
    fi
}

# Health Check
echo "📊 Health Check"
test_endpoint "GET" "/health" "" "" 200 "Health check"
echo ""

# Test Metadata Endpoints
echo "📁 Testing Metadata Endpoints"
test_endpoint "GET" "/categories" "" "" 200 "Get categories"
CATEGORY_ID=$(curl -s "$BASE_URL/categories" | jq -r '.data[0].id' 2>/dev/null || echo "")

test_endpoint "GET" "/countries" "" "" 200 "Get countries"
COUNTRY_ID=$(curl -s "$BASE_URL/countries" | jq -r '.data[0].id' 2>/dev/null || echo "")

test_endpoint "GET" "/tags" "" "" 200 "Get tags"
echo ""

# Test Registration
echo "🔐 Testing Authentication"
REGISTER_DATA='{"email":"test'$(date +%s)'@example.com","password":"Test123!@#","name":"Test User"}'
test_endpoint "POST" "/auth/register" "$REGISTER_DATA" "" 201 "Register new user"
ACCESS_TOKEN=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "$REGISTER_DATA" | jq -r '.data.accessToken' 2>/dev/null || echo "")

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
    echo -e "${YELLOW}⚠${NC} Could not get access token. Testing with login instead..."
    LOGIN_DATA='{"email":"test'$(date +%s)'@example.com","password":"Test123!@#"}'
    # First register
    curl -s -X POST "$BASE_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "$LOGIN_DATA" > /dev/null
    # Then login
    ACCESS_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "$LOGIN_DATA" | jq -r '.data.accessToken' 2>/dev/null || echo "")
fi

if [ ! -z "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    echo -e "${GREEN}✓${NC} Got access token: ${ACCESS_TOKEN:0:20}..."
    echo ""
    
    # Test Get Current User
    echo "👤 Testing User Endpoints"
    test_endpoint "GET" "/users/me" "" "$ACCESS_TOKEN" 200 "Get current user"
    USER_ID=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "$BASE_URL/users/me" | jq -r '.data.id' 2>/dev/null || echo "")
    echo ""
    
    # Test Create Project
    if [ ! -z "$CATEGORY_ID" ] && [ ! -z "$COUNTRY_ID" ]; then
        echo "🚀 Testing Project Endpoints"
        PROJECT_DATA="{\"name\":\"Test Project $(date +%s)\",\"description\":\"Test description\",\"countryId\":\"$COUNTRY_ID\",\"categoryId\":\"$CATEGORY_ID\"}"
        test_endpoint "POST" "/projects" "$PROJECT_DATA" "$ACCESS_TOKEN" 201 "Create project"
        PROJECT_ID=$(curl -s -X POST "$BASE_URL/projects" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$PROJECT_DATA" | jq -r '.data.id' 2>/dev/null || echo "")
        echo ""
    fi
    
    # Test List Projects
    test_endpoint "GET" "/projects?page=1&limit=10" "" "" 200 "List projects (public)"
    echo ""
else
    echo -e "${RED}✗${NC} Could not authenticate. Skipping authenticated endpoint tests."
    echo ""
fi

# Test Public Project Endpoints
if [ ! -z "$PROJECT_ID" ]; then
    test_endpoint "GET" "/projects/$PROJECT_ID" "" "" 200 "Get project by ID"
    echo ""
fi

# Test Search
echo "🔍 Testing Search"
test_endpoint "GET" "/search?q=bitcoin" "" "" 200 "Search projects"
echo ""

# Summary
echo "═══════════════════════════════════════"
echo "📊 Test Summary"
echo "═══════════════════════════════════════"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi

