---
title: Docker
slug: docker
description: Comandos esenciales para contenedores, imágenes, volúmenes, redes y Docker Compose.
icon: 🐳
category: containers
tags: [docker, containers, devops, deployment]
level: intermediate
tips:
  - type: tip
    text: Usa -d para ejecutar contenedores en background y liberar la terminal
  - type: warning
    text: Siempre nombra tus contenedores con --name para facilitar la gestión
  - type: info
    text: Usa --rm para contenedores temporales que se eliminan al salir
  - type: success
    text: Establece límites de recursos en producción con --memory y --cpus
---

## Contenedores

### Ejecutar contenedores

```bash
# Run container in foreground
docker run nginx
docker run -d nginx                        # Detached mode
docker run -it ubuntu bash                 # Interactive
docker run --name web nginx                # Named container

# Port mapping
docker run -p 8080:80 nginx               # Host:Container
docker run -P nginx                        # Random ports

# Volume mounting
docker run -v /host:/container nginx       # Bind mount
docker run -v myvolume:/data nginx         # Named volume

# Environment & resources
docker run -e ENV=production nginx
docker run --memory=512m --cpus=1.0 nginx
docker run --rm -it ubuntu bash            # Auto-remove on exit
```

```bash
# Detailed example — full production run
docker run -d \
  --name api-server \
  -p 8080:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=db.internal \
  -v /data/uploads:/app/uploads \
  -v logs:/app/logs \
  --memory=1g \
  --cpus=2 \
  --restart unless-stopped \
  --network app-network \
  my-api:v2.1
```

### Gestión de estado

```bash
# List containers
docker ps                  # Running only
docker ps -a               # All (including stopped)
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Lifecycle
docker stop <name>
docker start <name>
docker restart <name>
docker rm <name>            # Remove stopped container
docker rm -f <name>         # Force remove running container
docker container prune      # Remove all stopped containers
```

```bash
# Detailed example — batch cleanup
# Stop all running containers
docker stop $(docker ps -q)

# Remove all stopped containers + dangling images
docker system prune

# Remove everything (containers, images, volumes, networks)
docker system prune -a --volumes
```

### Inspección y logs

```bash
# Logs
docker logs web
docker logs -f web                         # Follow (real-time)
docker logs --tail 100 web                 # Last N lines
docker logs --since 1h web                 # Since 1 hour ago

# Exec & inspect
docker exec -it web bash                   # Interactive shell
docker exec web env | grep DB             # Run one-off command
docker inspect web                         # Full JSON metadata
docker stats                               # Live resource usage
docker cp web:/app/logs/err.log ./         # Copy file out
```

```bash
# Detailed example — debugging a crashed container
# Check last 50 lines with timestamps
docker logs --tail 50 --timestamps api-server

# Inspect specific field with Go template
docker inspect --format='{{.State.ExitCode}}' api-server
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' api-server

# Enter a running container as root
docker exec -it --user root api-server bash
```

## Imágenes

### Build de imágenes

```bash
# Basic build
docker build -t mi-imagen:v1.0 .
docker build -f ./docker/Dockerfile -t mi-imagen .
docker build --target production -t mi-imagen .
docker build --no-cache -t mi-imagen .

# With build args
docker build --build-arg NODE_ENV=production -t mi-imagen .
```

```bash
# Detailed example — multi-stage build command
docker build \
  --target production \
  --build-arg APP_VERSION=2.1.0 \
  --build-arg BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --cache-from mi-imagen:latest \
  --label "maintainer=team@empresa.com" \
  -t mi-imagen:2.1.0 \
  -t mi-imagen:latest \
  .
```

### Operaciones con imágenes

```bash
# Basic ops
docker images
docker pull ubuntu:22.04
docker rmi mi-imagen:v1.0
docker image prune -a             # Remove all unused images
docker save mi-imagen | gzip > backup.tar.gz
docker load < backup.tar.gz
```

```bash
# Detailed example — tag and push to registry
# Tag for Docker Hub
docker tag mi-imagen:latest usuario/mi-imagen:v1.0

# Tag for private registry
docker tag mi-imagen:latest registry.empresa.com/backend/mi-imagen:v1.0

# Push both
docker push usuario/mi-imagen:v1.0
docker push registry.empresa.com/backend/mi-imagen:v1.0
```

## Volúmenes y Redes

### Gestión de volúmenes

```bash
docker volume create mi-datos
docker volume ls
docker volume inspect mi-datos
docker volume rm mi-datos
docker volume prune             # Remove unused volumes
```

```bash
# Detailed example — backup a named volume
docker run --rm \
  -v mi-datos:/source \
  -v $(pwd):/backup \
  alpine tar czf /backup/mi-datos-$(date +%Y%m%d).tar.gz -C /source .
```

### Gestión de redes

```bash
docker network create mi-red
docker network ls
docker network inspect mi-red
docker network connect mi-red web
docker network disconnect mi-red web
docker network rm mi-red
```

```bash
# Detailed example — multi-container network setup
# Create isolated network
docker network create --driver bridge --subnet 172.20.0.0/16 app-network

# Run containers on same network (they resolve by name)
docker run -d --name db --network app-network postgres:15
docker run -d --name api --network app-network -e DB_HOST=db my-api
docker run -d --name nginx --network app-network -p 80:80 nginx
```

## Docker Compose

### Comandos básicos

```bash
docker compose up -d              # Start in background
docker compose up -d --build      # Force rebuild before start
docker compose down               # Stop and remove containers
docker compose down -v            # Also remove volumes
docker compose logs -f            # Follow all logs
docker compose logs -f api        # Follow specific service
docker compose ps                 # Show service status
docker compose restart api        # Restart one service
docker compose exec api bash      # Shell into service
docker compose pull               # Pull latest images
```

```bash
# Detailed example — docker-compose.yml production-ready
version: '3.8'

services:
  api:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app-network
    deploy:
      resources:
        limits:
          memory: 512M

  db:
    image: postgres:15-alpine
    volumes:
      - pg-data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      retries: 5
    networks:
      - app-network

volumes:
  pg-data:

networks:
  app-network:
    driver: bridge

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

## Sistema y limpieza

```bash
docker system df              # Disk usage by Docker
docker system prune           # Remove unused resources
docker system prune -a        # Remove ALL unused (including images)
docker system info            # System-wide info
docker version                # Client & server versions
```
