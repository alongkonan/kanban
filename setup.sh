#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Homework Kanban - Setup Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js 16+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js detected: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm detected: $(npm -v)\n"

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Dependencies installed\n"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env file created\n"
else
    echo -e "${GREEN}✓${NC} .env file already exists\n"
fi

# Display next steps
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Setup Complete!${NC}"
echo -e "${BLUE}========================================\n${NC}"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Start the development server:"
echo -e "   ${GREEN}npm start${NC}\n"

echo -e "2. Open in your browser:"
echo -e "   ${GREEN}http://localhost:3000${NC}\n"

echo -e "${YELLOW}Features:${NC}"
echo "✓ Dashboard with statistics"
echo "✓ Homework management (add/edit/delete)"
echo "✓ Priority scoring and sorting"
echo "✓ Calendar view"
echo "✓ LINE OA notifications"
echo "✓ Responsive mobile design"
echo "✓ Scheduled reminders (5 PM daily)\n"

echo -e "${YELLOW}Database:${NC}"
echo "SQLite database created at: ./homework.db\n"

echo -e "${YELLOW}Configuration:${NC}"
echo "Edit .env file to customize:"
echo "  - PORT: Server port (default: 3000)"
echo "  - LINE_CHANNEL_ID: LINE OA Channel ID"
echo "  - LINE_ACCESS_TOKEN: LINE OA Access Token\n"
