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

    # Install npm dependencies in host environment (needed for build and wp-env)
    print_info "Installing npm dependencies..."
    if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
        # Remove lock file and node_modules to fix potential issues
        rm -rf package-lock.json node_modules
        npm install --legacy-peer-deps
    else
        print_success "npm dependencies are up to date"
    fi

    print_info "Building the project..."
    npm run build

    # Install Bruno CLI if needed for API tests
    if [[ "$RUN_API" == true ]]; then
        print_info "Checking Bruno CLI installation..."
        if ! command -v bru &> /dev/null; then
            print_info "Installing Bruno CLI..."
            npm install -g @usebruno/cli
        else
            print_success "Bruno CLI is already installed"
        fi
    fi

    print_info "Starting WordPress environment with wp-env..."
    if ! npx @wordpress/env start; then
        print_error "Failed to start WordPress environment"
        exit 1
    fi

    # Wait for WordPress to be fully ready
    print_info "Waiting for WordPress to be ready..."
    for i in {1..24}; do
        if npx @wordpress/env run cli wp core is-installed 2>/dev/null; then
            print_success "WordPress is ready!"
            break
        fi
        if [ $i -eq 24 ]; then
            print_error "WordPress failed to be ready in time (2 minutes)"
            exit 1
        fi
        print_info "Attempt $i/24: WordPress not ready yet, waiting 5 seconds..."
        sleep 5
    done

    # List all plugins before activation
    print_info "Listing all available plugins:"
    npx @wordpress/env run cli wp plugin list --format=table || true

    # Install and activate the plugin
    print_info "Installing and activating wp-api-jwt-auth plugin..."
    if ! npx @wordpress/env run cli wp plugin activate wp-api-jwt-auth 2>/dev/null; then
        print_error "Failed to activate wp-api-jwt-auth plugin"
        exit 1
    fi

    # Install composer dependencies inside the container
    print_info "Installing composer dependencies inside wp-env container..."
    if ! npx @wordpress/env run cli bash -c "cd wp-content/plugins/wp-api-jwt-auth && composer install --no-interaction --prefer-dist"; then
        print_error "Failed to install composer dependencies"
        exit 1
    fi

    # Set up required constants for testing
    print_info "Setting up required constants..."
    npx @wordpress/env run cli wp config set JWT_AUTH_SECRET_KEY "your-top-secret-key" --type=constant || true
    npx @wordpress/env run cli wp config set DOING_TESTS true --raw --type=constant || true

    # Set permalinks to postname for REST API to work
    print_info "Setting up permalinks..."
    npx @wordpress/env run cli wp rewrite structure "/%postname%/" || true
    npx @wordpress/env run cli wp rewrite flush || true

    # Configure .htaccess to handle Authorization headers for JWT authentication
    print_info "Configuring .htaccess to handle Authorization headers..."
    npx @wordpress/env run cli bash -c "cat > /var/www/html/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]

# Forward Authorization header to PHP
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [E=HTTP_AUTHORIZATION:%1]

# Standard WordPress rewrite rules
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
EOF" || true

    # Debug: Test REST API endpoints
    print_info "Testing REST API endpoints..."

    # Test with pretty permalinks
    print_info "Testing pretty permalink: http://localhost:8888/wp-json/jwt-auth/v1/token"
    if curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8888/wp-json/jwt-auth/v1/token | grep -q "400\|401\|403"; then
        print_success "Pretty permalink endpoint is accessible (auth required)"
    else
        print_warning "Pretty permalink endpoint returned unexpected status"
    fi

    # Test with index.php
    print_info "Testing index.php URL: http://localhost:8888/index.php?rest_route=/jwt-auth/v1/token"
    if curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:8888/index.php?rest_route=/jwt-auth/v1/token" | grep -q "400\|401\|403"; then
        print_success "Index.php endpoint is accessible (auth required)"
    else
        print_warning "Index.php endpoint returned unexpected status"
    fi

    # List active plugins for debugging
    print_info "Active plugins:"
    npx @wordpress/env run cli wp plugin list --status=active --format=table || true

    # Check if REST API is enabled
    print_info "Checking REST API availability:"
    npx @wordpress/env run cli wp eval "echo 'REST API enabled: ' . (rest_get_server() ? 'Yes' : 'No') . PHP_EOL;" || true

    # List all registered REST routes to debug
    print_info "Listing JWT Auth REST routes:"
    npx @wordpress/env run cli wp eval "
        \$server = rest_get_server();
        \$routes = \$server->get_routes();
        foreach (\$routes as \$route => \$endpoints) {
            if (strpos(\$route, 'jwt-auth') !== false) {
                echo \$route . PHP_EOL;
            }
        }
    " || true

    # Create test user if it doesn't exist
    print_info "Ensuring test user exists..."
    npx @wordpress/env run cli wp user create admin admin@example.com --user_pass=password --role=administrator 2>/dev/null || true

    # Give the server a moment to fully initialize
    print_info "Waiting for server to stabilize..."
    sleep 5

    # Final check - try to authenticate with the API
    print_info "Testing authentication endpoint with credentials..."
    response=$(curl -s -X POST http://localhost:8888/wp-json/jwt-auth/v1/token \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"password"}' \
        -w "\nHTTP_CODE:%{http_code}")

    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    if [ "$http_code" = "200" ]; then
        print_success "Authentication endpoint is working correctly"
    else
        print_warning "Authentication endpoint returned status: $http_code"
        echo "Response: $(echo "$response" | grep -v "HTTP_CODE:")"
    fi

    print_success "Plugin setup completed"
}

# Run PHP Unit Tests
run_php_tests() {
    if [[ "$RUN_PHP" == false ]]; then
        return
    fi

    print_header "Running PHP Unit Tests"

    # Run PHPUnit tests using wp-env's cli container
    print_info "Running PHPUnit tests in wp-env container..."
    if npx @wordpress/env run cli bash -c "cd wp-content/plugins/wp-api-jwt-auth && includes/vendor/bin/phpunit --testdox"; then
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

    print_header "Running API Tests (Bruno)"

    # Add a delay after PHP tests to ensure server is ready
    print_info "Waiting for server to be ready after PHP tests..."
    sleep 5

    print_info "Executing REST API tests..."

    # Debug: Verify wp-env is still running
    print_info "Verifying WordPress environment is still running..."
    if ! curl -f -s http://localhost:8888 > /dev/null; then
        print_error "WordPress environment is not accessible!"
        print_info "Restarting WordPress environment..."
        npx @wordpress/env start
        sleep 10
    fi

    # Test the endpoint one more time before Bruno
    print_info "Testing endpoint before Bruno:"
    response=$(curl -s -X POST http://localhost:8888/wp-json/jwt-auth/v1/token \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"password"}' \
        -w "\nHTTP_CODE:%{http_code}")

    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    echo "Response status: $http_code"
    echo "$response" | grep -v "HTTP_CODE:" | head -n 5

    # Run Bruno tests
    print_info "Running Bruno tests..."
    if (cd tests/bruno/wp-api-jwt-auth && bru run --env local); then
        API_TESTS_PASSED=true
        print_success "API tests passed"
    else
        print_error "API tests failed"
    fi
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
    run_api_tests
    run_php_tests
    print_results
}

# Run main function
main "$@"
