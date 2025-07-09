#!/bin/bash

# WP API JWT Auth - Release Package Creator
# This script creates a release package excluding files listed in .distignore

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Set variables
PLUGIN_SLUG="wp-api-jwt-auth"
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PLUGIN_ROOT="$CURRENT_DIR/.."
DISTIGNORE_FILE="$PLUGIN_ROOT/.distignore"

# Get version from the main plugin file
VERSION=$(grep "Version:" "$PLUGIN_ROOT/jwt-auth.php" | awk -F': ' '{print $2}' | tr -d '\r' | xargs)

# Check if version was found
if [ -z "$VERSION" ]; then
    print_error "Could not determine plugin version from jwt-auth.php"
    exit 1
fi

# Check if .distignore exists
if [ ! -f "$DISTIGNORE_FILE" ]; then
    print_error ".distignore file not found at $DISTIGNORE_FILE"
    exit 1
fi

print_header "Creating Release Package"
print_info "Plugin: $PLUGIN_SLUG"
print_info "Version: $VERSION"

# Create a temporary directory
TEMP_DIR="$(mktemp -d)"
DEST_DIR="$TEMP_DIR/$PLUGIN_SLUG"

# Create destination directory
mkdir -p "$DEST_DIR"

print_info "Copying files to temporary directory..."

# Use rsync to copy files while respecting .distignore
# Convert .distignore patterns to rsync exclude format
RSYNC_EXCLUDES=""
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    if [[ -z "$line" ]] || [[ "$line" =~ ^# ]]; then
        continue
    fi

    # Trim whitespace
    line=$(echo "$line" | xargs)

    if [[ -n "$line" ]]; then
        RSYNC_EXCLUDES="$RSYNC_EXCLUDES --exclude=$line"
    fi
done < "$DISTIGNORE_FILE"

# Additional excludes for safety
RSYNC_EXCLUDES="$RSYNC_EXCLUDES --exclude=.git --exclude=.DS_Store --exclude=*.zip"

# Copy files using rsync with excludes
rsync -av --progress $RSYNC_EXCLUDES "$PLUGIN_ROOT/" "$DEST_DIR/"

# Install production composer dependencies if composer.json exists and vendor is not excluded
if [ -f "$DEST_DIR/composer.json" ] && [ ! -d "$DEST_DIR/includes/vendor" ]; then
    print_info "Installing production Composer dependencies..."
    cd "$DEST_DIR"
    composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction
    cd - > /dev/null
else
    print_info "Vendor directory already exists or composer.json not found, skipping composer install"
fi

# Build frontend assets if needed
if [ -f "$DEST_DIR/package.json" ] && [ ! -d "$DEST_DIR/admin/ui/dist" ]; then
    print_info "Building frontend assets..."
    cd "$DEST_DIR"
    npm install --production=false
    npm run build
    # Remove node_modules after build
    rm -rf node_modules
    cd - > /dev/null
else
    print_info "Frontend dist already exists or package.json not found, skipping build"
fi

# Create the zip file
print_info "Creating zip archive..."
cd "$TEMP_DIR"
ZIP_NAME="${PLUGIN_SLUG}.zip"
zip -r "$ZIP_NAME" "$PLUGIN_SLUG" -q

# Move zip to plugin root
mv "$ZIP_NAME" "$PLUGIN_ROOT/"

# Cleanup
print_info "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

print_success "Release package created successfully!"
print_info "📦 Package location: $PLUGIN_ROOT/$ZIP_NAME"
print_info "📏 Package size: $(du -h "$PLUGIN_ROOT/$ZIP_NAME" | cut -f1)"

# List contents summary
print_info "Package contents summary:"
unzip -l "$PLUGIN_ROOT/$ZIP_NAME" | tail -n 3
