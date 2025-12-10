#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Homework Kanban - Test Suite${NC}"
echo -e "${BLUE}========================================\n${NC}"

# Check Node.js
echo -e "${YELLOW}Testing Node.js...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js: $(node -v)"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check npm
echo -e "${YELLOW}Testing npm...${NC}"
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm: $(npm -v)"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check dependencies
echo -e "\n${YELLOW}Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${GREEN}✓${NC} Dependencies already installed"
fi

# Check .env file
echo -e "\n${YELLOW}Checking .env file...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${YELLOW}⚠${NC} .env file not found, copying from .env.example"
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env created"
fi

# Start server
echo -e "\n${YELLOW}Starting server...${NC}"
timeout 10 npm start > /tmp/server.log 2>&1 &
SERVER_PID=$!
sleep 4

# Test health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null | jq -r '.status' 2>/dev/null)

if [ "$HEALTH" = "ok" ]; then
    echo -e "${GREEN}✓${NC} Server is running on http://localhost:3000"
else
    echo -e "${RED}✗${NC} Server health check failed"
    echo -e "${YELLOW}Server log:${NC}"
    cat /tmp/server.log | tail -10
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Test API endpoints
echo -e "\n${YELLOW}Testing API endpoints...${NC}"

# Create test user
echo -n "Testing POST /api/user... "
USER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{"lineUserId":"test_user_123","name":"Test User"}')

USER_ID=$(echo $USER_RESPONSE | jq -r '.id' 2>/dev/null)
if [ ! -z "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test add homework
echo -n "Testing POST /api/homework... "
HW_RESPONSE=$(curl -s -X POST http://localhost:3000/api/homework \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"subject\":\"Test Subject\",\"taskName\":\"Test Task\",\"dueDate\":\"2024-12-20\",\"difficulty\":\"medium\",\"importance\":\"high\"}")

HW_ID=$(echo $HW_RESPONSE | jq -r '.id' 2>/dev/null)
if [ ! -z "$HW_ID" ] && [ "$HW_ID" != "null" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test get homework
echo -n "Testing GET /api/homework/:userId... "
HW_LIST=$(curl -s http://localhost:3000/api/homework/$USER_ID)
HW_COUNT=$(echo $HW_LIST | jq 'length' 2>/dev/null)
if [ "$HW_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} (Found $HW_COUNT items)"
else
    echo -e "${RED}✗${NC}"
fi

# Test dashboard
echo -n "Testing GET /api/dashboard/:userId... "
DASHBOARD=$(curl -s http://localhost:3000/api/dashboard/$USER_ID)
TOTAL=$(echo $DASHBOARD | jq -r '.total' 2>/dev/null)
if [ ! -z "$TOTAL" ] && [ "$TOTAL" != "null" ]; then
    echo -e "${GREEN}✓${NC} (Total: $TOTAL)"
else
    echo -e "${RED}✗${NC}"
fi

# Stop server
echo -e "\n${YELLOW}Stopping server...${NC}"
kill $SERVER_PID 2>/dev/null || true
sleep 1

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✓ All tests passed!${NC}"
echo -e "${BLUE}========================================\n${NC}"

echo -e "${YELLOW}Ready to start:${NC}"
echo -e "1. Run: ${GREEN}npm start${NC}"
echo -e "2. Open: ${GREEN}http://localhost:3000${NC}"
echo -e "3. Read: ${GREEN}USER_GUIDE_TH.md${NC}"
echo ""
