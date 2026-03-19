#!/bin/bash

# BattleCard Arena - Deployment Testing Script
# This script tests both local and production deployments

set -e

echo "🃏 BattleCard Arena - Deployment Testing"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    echo "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_status "Dependencies check passed"
}

# Test local deployment
test_local() {
    echo ""
    echo "🏠 Testing Local Deployment"
    echo "=========================="
    
    # Install dependencies
    echo "Installing dependencies..."
    npm ci
    
    # Setup database
    echo "Setting up database..."
    npx prisma generate
    npx prisma migrate dev --name init
    npm run db:seed
    
    # Build application
    echo "Building application..."
    npm run build
    
    # Install Playwright browsers
    echo "Installing Playwright browsers..."
    npx playwright install --with-deps
    
    # Run tests
    echo "Running local deployment tests..."
    npm run test:e2e
    
    print_status "Local deployment tests completed"
}

# Test production deployment
test_production() {
    local url=$1
    
    echo ""
    echo "🌐 Testing Production Deployment"
    echo "==============================="
    echo "URL: $url"
    
    if [ -z "$url" ]; then
        print_error "Production URL not provided"
        echo "Usage: ./test-deployment.sh production <URL>"
        exit 1
    fi
    
    # Set environment variables
    export TEST_ENV=production
    export PRODUCTION_URL=$url
    
    # Install Playwright browsers if not already installed
    if [ ! -d "node_modules/@playwright" ]; then
        echo "Installing Playwright..."
        npm ci
        npx playwright install --with-deps
    fi
    
    # Run production tests
    echo "Running production deployment tests..."
    npm run test:e2e:production
    
    print_status "Production deployment tests completed"
}

# Performance testing
test_performance() {
    local url=${1:-"http://localhost:3030"}
    
    echo ""
    echo "⚡ Performance Testing"
    echo "===================="
    echo "URL: $url"
    
    # Simple curl-based performance test
    echo "Testing page load times..."
    
    for page in "/" "/create-card" "/collection" "/battle"; do
        echo -n "Testing $page... "
        time_taken=$(curl -o /dev/null -s -w "%{time_total}" "$url$page")
        
        if (( $(echo "$time_taken < 2.0" | bc -l) )); then
            print_status "${time_taken}s (✓ < 2s)"
        else
            print_warning "${time_taken}s (⚠️  > 2s)"
        fi
    done
}

# Main script logic
case "$1" in
    "local")
        check_dependencies
        test_local
        test_performance
        ;;
    "production")
        check_dependencies
        test_production "$2"
        test_performance "$2"
        ;;
    "performance")
        test_performance "$2"
        ;;
    *)
        echo "Usage: $0 {local|production <URL>|performance [URL]}"
        echo ""
        echo "Examples:"
        echo "  $0 local                                    # Test local deployment"
        echo "  $0 production https://your-app.vercel.app   # Test production deployment"
        echo "  $0 performance http://localhost:3030        # Test performance only"
        exit 1
        ;;
esac

echo ""
print_status "All deployment tests completed! 🎉"
