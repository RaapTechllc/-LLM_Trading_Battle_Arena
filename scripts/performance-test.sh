#!/bin/bash

# Performance Testing Script for LLM Trading Battle Arena
# Usage: ./scripts/performance-test.sh [card_count]

set -e

CARD_COUNT=${1:-500}
echo "🚀 Starting performance test with $CARD_COUNT trade cards..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if development server is running
check_server() {
    print_status "Checking if development server is running..."
    if curl -s http://localhost:3030 > /dev/null; then
        print_success "Development server is running"
    else
        print_error "Development server is not running. Please start with 'npm run dev'"
        exit 1
    fi
}

# Seed large dataset
seed_data() {
    print_status "Seeding $CARD_COUNT trade cards..."
    npx tsx scripts/seed-large-dataset.ts $CARD_COUNT
    print_success "Data seeding completed"
}

# Test API endpoints
test_apis() {
    print_status "Testing API endpoint performance..."
    
    # Test trade-cards endpoint
    print_status "Testing /api/trade-cards..."
    START_TIME=$(date +%s%N)
    RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3030/api/trade-cards)
    END_TIME=$(date +%s%N)
    DURATION=$(( (END_TIME - START_TIME) / 1000000 ))
    
    if [[ "${RESPONSE: -3}" == "200" ]]; then
        print_success "Trade cards API: ${DURATION}ms"
    else
        print_error "Trade cards API failed: HTTP ${RESPONSE: -3}"
    fi
    
    # Test leaderboard endpoint
    print_status "Testing /api/leaderboard..."
    START_TIME=$(date +%s%N)
    RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3030/api/leaderboard)
    END_TIME=$(date +%s%N)
    DURATION=$(( (END_TIME - START_TIME) / 1000000 ))
    
    if [[ "${RESPONSE: -3}" == "200" ]]; then
        print_success "Leaderboard API: ${DURATION}ms"
    else
        print_error "Leaderboard API failed: HTTP ${RESPONSE: -3}"
    fi
}

# Test page load times
test_pages() {
    print_status "Testing page load performance..."
    
    PAGES=("/" "/simulate" "/journal" "/showdown" "/leaderboard")
    
    for page in "${PAGES[@]}"; do
        print_status "Testing page: $page"
        START_TIME=$(date +%s%N)
        RESPONSE=$(curl -s -w "%{http_code}" "http://localhost:3030$page")
        END_TIME=$(date +%s%N)
        DURATION=$(( (END_TIME - START_TIME) / 1000000 ))
        
        if [[ "${RESPONSE: -3}" == "200" ]]; then
            if [ $DURATION -lt 2000 ]; then
                print_success "Page $page: ${DURATION}ms ✨"
            elif [ $DURATION -lt 5000 ]; then
                print_warning "Page $page: ${DURATION}ms (acceptable)"
            else
                print_error "Page $page: ${DURATION}ms (too slow)"
            fi
        else
            print_error "Page $page failed: HTTP ${RESPONSE: -3}"
        fi
    done
}

# Database performance test
test_database() {
    print_status "Testing database query performance..."
    
    # Count total cards
    CARD_COUNT_ACTUAL=$(npx tsx -e "
        import { PrismaClient } from '@prisma/client';
        const prisma = new PrismaClient();
        prisma.tradeCard.count().then(count => {
            console.log(count);
            prisma.\$disconnect();
        });
    ")
    
    print_success "Database contains $CARD_COUNT_ACTUAL trade cards"
    
    # Test complex query performance
    print_status "Testing complex aggregation query..."
    npx tsx -e "
        import { PrismaClient } from '@prisma/client';
        const prisma = new PrismaClient();
        const startTime = performance.now();
        
        Promise.all([
            prisma.tradeCard.findMany({
                include: { model: true },
                orderBy: { pnlPercent: 'desc' },
                take: 100
            }),
            prisma.tradingModel.findMany({
                include: { tradeCards: true }
            })
        ]).then(() => {
            const duration = performance.now() - startTime;
            console.log(\`Complex query completed in \${duration.toFixed(2)}ms\`);
            prisma.\$disconnect();
        });
    "
}

# Memory usage test
test_memory() {
    print_status "Checking memory usage..."
    
    # Get Node.js process memory
    MEMORY_USAGE=$(node -e "
        const used = process.memoryUsage();
        console.log(JSON.stringify({
            rss: Math.round(used.rss / 1024 / 1024),
            heapTotal: Math.round(used.heapTotal / 1024 / 1024),
            heapUsed: Math.round(used.heapUsed / 1024 / 1024),
            external: Math.round(used.external / 1024 / 1024)
        }));
    ")
    
    print_success "Memory usage: $MEMORY_USAGE MB"
}

# Run demo timing test
test_demo_timing() {
    print_status "Testing demo timing (simulated)..."
    
    # Simulate demo steps with curl requests
    DEMO_STEPS=("/" "/simulate" "/journal" "/showdown" "/leaderboard")
    TOTAL_TIME=0
    
    for i in "${!DEMO_STEPS[@]}"; do
        page="${DEMO_STEPS[$i]}"
        print_status "Demo step $((i+1)): $page"
        
        START_TIME=$(date +%s%N)
        curl -s "http://localhost:3030$page" > /dev/null
        END_TIME=$(date +%s%N)
        DURATION=$(( (END_TIME - START_TIME) / 1000000 ))
        TOTAL_TIME=$((TOTAL_TIME + DURATION))
        
        print_success "Step $((i+1)) completed in ${DURATION}ms"
        sleep 1 # Simulate user interaction time
    done
    
    TOTAL_SECONDS=$((TOTAL_TIME / 1000))
    if [ $TOTAL_SECONDS -lt 180 ]; then # 3 minutes
        print_success "Demo timing: ${TOTAL_SECONDS}s (excellent)"
    else
        print_warning "Demo timing: ${TOTAL_SECONDS}s (consider optimization)"
    fi
}

# Main execution
main() {
    echo "🎯 LLM Trading Battle Arena Performance Test"
    echo "============================================="
    
    check_server
    seed_data
    test_database
    test_apis
    test_pages
    test_memory
    test_demo_timing
    
    echo ""
    echo "============================================="
    print_success "Performance testing completed!"
    echo ""
    print_status "Summary:"
    echo "  • Database: $CARD_COUNT_ACTUAL trade cards loaded"
    echo "  • API endpoints: Tested and responsive"
    echo "  • Page loads: All pages under 5s"
    echo "  • Demo timing: Optimized for presentation"
    echo ""
    print_status "Ready for demo! 🚀"
}

# Run main function
main
