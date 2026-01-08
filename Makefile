# Makefile for Pokémon Docker setup

# Project directories
FRONTEND_DIR=frontend
BACKEND_DIR=backend

# Docker Compose file (if named differently, adjust here)
COMPOSE_FILE=docker-compose.yml

# Default: build and start containers
up: build
	docker compose -f $(COMPOSE_FILE) up -d

# Build frontend and backend images
build:
	docker compose -f $(COMPOSE_FILE) build

# Stop containers
down:
	docker compose -f $(COMPOSE_FILE) down

# Stop and remove containers, networks, volumes, and images
prune: down
	@echo "🔹 Removing all Docker volumes and images..."
	docker system prune -af --volumes

# Tail logs for all services
logs:
	docker compose -f $(COMPOSE_FILE) logs -f

# Rebuild backend and frontend with no cache
rebuild: prune up

# Restart all services
restart: down up

# Show status of all containers
ps:
	docker compose -f $(COMPOSE_FILE) ps

# Enter backend container shell
bash-backend:
	docker exec -it $$(docker compose -f $(COMPOSE_FILE) ps -q backend) sh

# Enter frontend container shell
bash-frontend:
	docker exec -it $$(docker compose -f $(COMPOSE_FILE) ps -q frontend) sh

# Clean npm/node_modules and package-lock.json in frontend and backend
clean-npm:
	@echo "🔹 Cleaning npm packages..."
	rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/package-lock.json
	rm -rf $(BACKEND_DIR)/node_modules $(BACKEND_DIR)/package-lock.json

# Reset everything: prune docker + clean npm
reset: prune clean-npm
