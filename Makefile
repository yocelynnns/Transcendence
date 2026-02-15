FRONTEND_DIR=frontend
BACKEND_DIR=backend
COMPOSE_FILE=docker-compose.yml
ENV_FILE=.env
ENV_EXAMPLE=.env.example
SSL_DIR=ssl

make: up

# Check if .env exists, if not copy from .env.example
check-env:
	@if [ ! -f $(ENV_FILE) ]; then \
		if [ -f $(ENV_EXAMPLE) ]; then \
			echo "⚠️  .env not found, copying from .env.example..."; \
			cp $(ENV_EXAMPLE) $(ENV_FILE); \
			echo "✅ .env created from .env.example"; \
		else \
			echo "❌ ERROR: Neither .env nor .env.example found!"; \
			exit 1; \
		fi \
	fi

# Generate SSL certificates if they don't exist
check-ssl:
	@if [ ! -f $(SSL_DIR)/localhost.key ] || [ ! -f $(SSL_DIR)/localhost.crt ]; then \
		echo "🔐 Generating SSL certificates..."; \
		./generate-ssl.sh; \
		echo "✅ SSL certificates generated"; \
	else \
		echo "✅ SSL certificates already exist"; \
	fi

# build and start containers
up: check-env check-ssl build
	docker compose -f $(COMPOSE_FILE) up -d

# Build frontend and backend images
build: check-env
	docker compose -f $(COMPOSE_FILE) build

# Stop containers
down:
	docker compose -f $(COMPOSE_FILE) down

# Stop and remove containers (keeps volumes/data)
prune: down
	@echo "🔹 Removing unused Docker resources (keeping volumes)..."
	docker system prune -af

# DANGER: Remove everything including database data
nuke:
	@echo "⚠️ WARNING: This will delete ALL data including MongoDB!"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds..."
	@sleep 5
	docker compose down -v
	docker system prune -af
	@echo "✅ Everything deleted!"
	
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
