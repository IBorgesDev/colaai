#!/bin/bash

# EventPlatform Setup Script
# This script automates the Docker environment setup

set -e  # Exit on any error

echo "🚀 EventPlatform - Automated Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if Docker daemon is running
check_docker_daemon() {
    print_status "Checking if Docker daemon is running..."
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker daemon is running"
}

# Create .env file if it doesn't exist
create_env_file() {
    print_status "Creating environment file..."
    if [ ! -f .env ]; then
        cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://eventplatform:eventplatform_password@localhost:5432/eventplatform"

# Application Configuration
NODE_ENV=development
NEXTAUTH_SECRET=your-secret-key-change-in-production-$(openssl rand -base64 32 | tr -d '\n')
NEXTAUTH_URL=http://localhost:3000

# Docker Database Configuration (for containers)
POSTGRES_DB=eventplatform
POSTGRES_USER=eventplatform
POSTGRES_PASSWORD=eventplatform_password
EOF
        print_success ".env file created with default configuration"
    else
        print_warning ".env file already exists, skipping creation"
    fi
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    docker-compose build --no-cache
    print_success "Docker images built successfully"
}

# Start services
start_services() {
    print_status "Starting PostgreSQL database..."
    docker-compose up -d postgres
    
    print_status "Waiting for database to be ready..."
    sleep 15
    
    # Check if database is ready
    local retries=30
    while [ $retries -gt 0 ]; do
        if docker-compose exec postgres pg_isready -U eventplatform -d eventplatform &> /dev/null; then
            print_success "Database is ready"
            break
        fi
        print_status "Waiting for database... ($retries attempts remaining)"
        sleep 2
        ((retries--))
    done
    
    if [ $retries -eq 0 ]; then
        print_error "Database failed to start properly"
        exit 1
    fi
}

# Setup database schema and seed data
setup_database() {
    print_status "Setting up database schema..."
    docker-compose run --rm app npm run db:push
    print_success "Database schema applied"
    
    print_status "Seeding database with initial data..."
    docker-compose run --rm app npm run db:seed
    print_success "Database seeded successfully"
}

# Start application
start_application() {
    print_status "Starting the application..."
    docker-compose up -d app
    print_success "Application started"
}

# Display final information
show_final_info() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================"
    echo ""
    echo "📍 Services:"
    echo "   🌐 Application: http://localhost:3000"
    echo "   🗄️  Database: localhost:5432"
    echo ""
    echo "👤 Test Credentials:"
    echo "   📧 Admin: admin@eventplatform.com"
    echo "   🔑 Password: admin123"
    echo ""
    echo "   📧 User: user1@example.com"
    echo "   🔑 Password: user123"
    echo ""
    echo "🛠️  Useful Commands:"
    echo "   📊 Prisma Studio: make studio"
    echo "   📋 View logs: make logs"
    echo "   🔄 Restart: make restart"
    echo "   🛑 Stop: make down"
    echo ""
    echo "📖 For more commands, run: make help"
}

# Cleanup function for interruptions
cleanup() {
    print_warning "Setup interrupted. Cleaning up..."
    docker-compose down 2>/dev/null || true
    exit 1
}

# Set trap for cleanup
trap cleanup INT TERM

# Main execution
main() {
    echo ""
    check_docker
    check_docker_daemon
    create_env_file
    build_images
    start_services
    setup_database
    start_application
    show_final_info
}

# Run main function
main "$@" 