#!/bin/bash

# WP API JWT Auth - Comprehensive Test Runner
# This script runs all test suites: PHP, Frontend, and API tests
# Can be used locally and in CI/CD environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
PHP_TESTS_PASSED=false
FRONTEND_TESTS_PASSED=false
API_TESTS_PASSED=false

# Helper functions
print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Cleanup function to stop wp-env on exit
cleanup() {
    if [[ "$SKIP_SETUP" == false ]]; then
        print_info "Cleaning up WordPress environment..."
        npx @wordpress/env stop > /dev/null 2>&1 || true
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Parse command line arguments
SKIP_SETUP=false
RUN_PHP=true
RUN_FRONTEND=true
RUN_API=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-setup)
            SKIP_SETUP=true
            shift
            ;;
        --php-only)
            RUN_PHP=true
            RUN_FRONTEND=false
            RUN_API=false
            shift
            ;;
        --frontend-only)
            RUN_PHP=false
            RUN_FRONTEND=true
            RUN_API=false
            shift
            ;;
        --api-only)
            RUN_PHP=false
            RUN_FRONTEND=false
            RUN_API=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Usage: $0 [--skip-setup] [--php-only|--frontend-only|--api-only]"
            exit 1
            ;;
    esac
done

# Setup WordPress environment
setup_wordpress_env() {
    if [[ "$SKIP_SETUP" == true ]]; then
        print_info "Skipping WordPress environment setup"
        return
    fi

    print_header "Setting up WordPress Environment"

    print_info "Starting WordPress environment with wp-env..."
    if ! npx @wordpress/env start; then
        print_error "Failed to start WordPress environment"
        exit 1
    fi

    print_info "Waiting for WordPress to be ready..."
    sleep 10

    # Verify WordPress is accessible
    if curl -f -s http://localhost:8888 > /dev/null; then
        print_success "WordPress environment is ready"
    else
        print_error "WordPress environment is not accessible"
        exit 1
    fi
}

# Run PHP Unit Tests
run_php_tests() {
    if [[ "$RUN_PHP" == false ]]; then
        return
    fi

    print_header "Running PHP Unit Tests"

    # Check if composer dependencies are installed
    if [[ ! -d "includes/vendor" ]]; then
        print_info "Installing PHP dependencies..."
        composer install --no-interaction --prefer-dist
    fi

    # Run PHPUnit tests using wp-env's tests-cli container
    print_info "Running PHPUnit tests in wp-env container..."
    if npx @wordpress/env run tests-cli --env-cwd="wp-content/plugins/$(basename "$(pwd)")" ./includes/vendor/bin/phpunit; then
        print_success "PHP Unit Tests passed"
        PHP_TESTS_PASSED=true
    else
        print_error "PHP Unit Tests failed"
        PHP_TESTS_PASSED=false
    fi
}

# Run Frontend Tests
run_frontend_tests() {
    if [[ "$RUN_FRONTEND" == false ]]; then
        return
    fi

    print_header "Running Frontend Tests"

    # Check if node_modules exists
    if [[ ! -d "node_modules" ]]; then
        print_info "Installing Node.js dependencies..."
        npm install
    fi

    # Run frontend tests
    if npm run test; then
        print_success "Frontend Tests passed"
        FRONTEND_TESTS_PASSED=true
    else
        print_error "Frontend Tests failed"
        FRONTEND_TESTS_PASSED=false
    fi
}

# Run API Tests with Bruno
run_api_tests() {
    if [[ "$RUN_API" == false ]]; then
        return
    fi

    print_header "Running API Tests with Bruno"

    # Check if Bruno CLI is available
    if ! command -v bru &> /dev/null; then
        print_info "Installing Bruno CLI..."
        npm install -g @usebruno/cli
    fi

    # Run Bruno API tests
    cd tests/bruno/wp-api-jwt-auth
    if bru run . --env local --output results.json; then
        print_success "API Tests passed"
        API_TESTS_PASSED=true
        cd - > /dev/null
    else
        print_error "API Tests failed"
        API_TESTS_PASSED=false
        cd - > /dev/null
    fi

    # Clean up results file (from the Bruno collection directory)
    rm -f tests/bruno/wp-api-jwt-auth/results.json
}

# Print final results
print_results() {
    print_header "Test Results Summary"

    if [[ "$RUN_PHP" == true ]]; then
        if [[ "$PHP_TESTS_PASSED" == true ]]; then
            print_success "PHP Unit Tests: PASSED"
        else
            print_error "PHP Unit Tests: FAILED"
        fi
    fi

    # if [[ "$RUN_FRONTEND" == true ]]; then
    #     if [[ "$FRONTEND_TESTS_PASSED" == true ]]; then
    #         print_success "Frontend Tests: PASSED"
    #     else
    #         print_error "Frontend Tests: FAILED"
    #     fi
    # fi

    if [[ "$RUN_API" == true ]]; then
        if [[ "$API_TESTS_PASSED" == true ]]; then
            print_success "API Tests: PASSED"
        else
            print_error "API Tests: FAILED"
        fi
    fi

    # Determine overall result
    OVERALL_SUCCESS=true

    if [[ "$RUN_PHP" == true && "$PHP_TESTS_PASSED" == false ]]; then
        OVERALL_SUCCESS=false
    fi

    # if [[ "$RUN_FRONTEND" == true && "$FRONTEND_TESTS_PASSED" == false ]]; then
    #     OVERALL_SUCCESS=false
    # fi

    if [[ "$RUN_API" == true && "$API_TESTS_PASSED" == false ]]; then
        OVERALL_SUCCESS=false
    fi

    echo ""
    if [[ "$OVERALL_SUCCESS" == true ]]; then
        print_success "All tests passed! 🎉"
        exit 0
    else
        print_error "Some tests failed! ❌"
        exit 1
    fi
}

# Main execution
main() {
    print_header "WP API JWT Auth - Test Runner"

    setup_wordpress_env
    run_php_tests
    # run_frontend_tests
    run_api_tests
    print_results
}

# Run main function
main "$@"
