# EventPlatform - Docker Commands Makefile

.PHONY: help build up down logs restart clean setup seed studio test

# Default target
help: ## Show this help message
	@echo "EventPlatform - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Development Commands
build: ## Build all Docker images
	docker-compose build

up: ## Start all services in development mode
	docker-compose up -d postgres
	@echo "Waiting for database to be ready..."
	@sleep 10
	docker-compose up app

up-detached: ## Start all services in background
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## Show logs from all services
	docker-compose logs -f

logs-app: ## Show logs from app service only
	docker-compose logs -f app

logs-postgres: ## Show logs from postgres service only
	docker-compose logs -f postgres

# Database Commands
setup: ## Setup database (push schema and seed data)
	docker-compose exec app npm run db:push
	docker-compose exec app npm run db:seed

seed: ## Seed database with initial data
	docker-compose exec app npm run db:seed

studio: ## Start Prisma Studio
	docker-compose --profile studio up prisma-studio

# Production Commands
prod-build: ## Build production image
	docker-compose build app-prod

prod-up: ## Start production services
	docker-compose --profile production up -d

prod-down: ## Stop production services
	docker-compose --profile production down

# Maintenance Commands
clean: ## Remove all containers, volumes and images
	docker-compose down -v --rmi all

clean-volumes: ## Remove only volumes (database data will be lost!)
	docker-compose down -v

reset: ## Complete reset (clean + build + setup)
	make clean
	make build
	make up-detached
	@sleep 15
	make setup

# Development Helpers
shell: ## Access app container shell
	docker-compose exec app sh

shell-postgres: ## Access postgres container shell
	docker-compose exec postgres psql -U eventplatform -d eventplatform

install: ## Install new npm packages (usage: make install PACKAGE=package-name)
	docker-compose exec app npm install $(PACKAGE)

# Testing
test: ## Run tests
	docker-compose exec app npm test

# Backup and Restore
backup: ## Backup database
	docker-compose exec postgres pg_dump -U eventplatform eventplatform > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore: ## Restore database (usage: make restore FILE=backup.sql)
	docker-compose exec -T postgres psql -U eventplatform eventplatform < $(FILE)

# Status and Information
status: ## Show status of all containers
	docker-compose ps

images: ## Show Docker images
	docker-compose images

volumes: ## Show Docker volumes
	docker volume ls | grep eventplatform

# Network
network: ## Show network information
	docker network ls | grep eventplatform

# Redis (when using cache profile)
redis-up: ## Start Redis cache
	docker-compose --profile cache up -d redis

redis-cli: ## Access Redis CLI
	docker-compose exec redis redis-cli

# Quick Start
quick-start: ## Quick start for first time setup
	@echo "🚀 Starting EventPlatform for the first time..."
	make build
	make up-detached
	@echo "⏳ Waiting for services to be ready..."
	@sleep 20
	make setup
	@echo "✅ EventPlatform is ready!"
	@echo "🌐 Access the app at: http://localhost:3000"
	@echo "🎯 Access Prisma Studio: make studio (then go to http://localhost:5555)"

# Stop everything
stop-all: ## Stop all Docker containers (not just this project)
	docker stop $$(docker ps -q)

# Development with hot reload
dev: ## Start development environment with hot reload
	docker-compose up postgres -d
	@echo "Database started. You can now run 'npm run dev' locally or use 'make up' to run in Docker" 