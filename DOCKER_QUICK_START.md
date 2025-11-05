# 🐳 GUÍA RÁPIDA: DOCKER & DEPLOYMENT

**Status:** MVP Completamente Funcional → Preparado para Dockerización  
**Tiempo Estimado:** 2-3 horas  
**Complejidad:** Media

---

## 📋 PRE-REQUISITOS

```bash
# Docker
docker --version    # >= 20.10
docker ps

# Docker Compose
docker-compose --version  # >= 2.0

# Git (para CI/CD)
git --version
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

**Instalar si es necesario:**
- **macOS:** `brew install docker docker-compose`
- **Linux:** `sudo apt-get install docker.io docker-compose`
- **Windows:** Docker Desktop desde docker.com

---

## 🚀 PASO 1: CREAR DOCKERFILE DEL BACKEND

Crea `/home/llibre/apartamento_airbnb/backend/Dockerfile`:

```dockerfile
# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY src ./src
COPY tsconfig.json .
COPY .env.example .env

# Build
RUN npm run build

# Etapa 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm install --only=production

# Copiar build desde etapa anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env .env

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["npm", "run", "start:prod"]
```

---

## 🎨 PASO 2: CREAR DOCKERFILE DEL FRONTEND

Crea `/home/llibre/apartamento_airbnb/frontend/Dockerfile`:

```dockerfile
# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar fuente
COPY . .

# Build con Vite
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar build a Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Puerto
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔧 PASO 3: CREAR NGINX CONFIG PARA FRONTEND

Crea `/home/llibre/apartamento_airbnb/frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Single Page Application routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Static assets cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        expires 1y;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Redirect non-existent files to index
    error_page 404 =200 /index.html;
}
```

---

## 📝 PASO 4: CREAR DOCKER COMPOSE

Crea `/home/llibre/apartamento_airbnb/docker-compose.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: apartamento_postgres
    environment:
      POSTGRES_USER: ${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-apartamento_airbnb}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - apartamento_network

  # NestJS Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: apartamento_backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: ${DB_USERNAME:-postgres}
      DB_PASSWORD: ${DB_PASSWORD:-postgres}
      DB_NAME: ${DB_NAME:-apartamento_airbnb}
      JWT_SECRET: ${JWT_SECRET:-dev-secret-key-change-in-prod}
      NODE_ENV: ${NODE_ENV:-development}
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    volumes:
      - ./backend/src:/app/src
    networks:
      - apartamento_network
    restart: unless-stopped

  # React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: apartamento_frontend
    environment:
      REACT_APP_API_URL: ${REACT_APP_API_URL:-http://localhost:3001}
    ports:
      - "3000:80"
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - apartamento_network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local

networks:
  apartamento_network:
    driver: bridge
```

---

## ⚙️ PASO 5: CREAR ARCHIVO .ENV PARA DOCKER

Crea `/home/llibre/apartamento_airbnb/.env.docker`:

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=apartamento_user
DB_PASSWORD=apartamento_secure_password_2025
DB_NAME=apartamento_airbnb

# JWT
JWT_SECRET=super-secret-jwt-key-change-in-production-12345
JWT_EXPIRATION=24h

# Node
NODE_ENV=development
PORT=3001

# Frontend
REACT_APP_API_URL=http://localhost:3001

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (futuro)
SENDGRID_API_KEY=placeholder

# AWS (futuro)
AWS_ACCESS_KEY_ID=placeholder
AWS_SECRET_ACCESS_KEY=placeholder
AWS_REGION=eu-west-1
AWS_BUCKET=apartamento-airbnb

# Stripe (futuro)
STRIPE_SECRET_KEY=placeholder
STRIPE_PUBLIC_KEY=placeholder
```

---

## 🚀 PASO 6: EJECUTAR CON DOCKER COMPOSE

```bash
# Navegar al directorio del proyecto
cd /home/llibre/apartamento_airbnb

# Copiar .env
cp .env.docker .env

# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up

# En otra terminal, verificar logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Output esperado:**
```
apartamento_postgres  | database system is ready to accept connections
apartamento_backend   | [NestFactory] Nest application successfully started on port 3001
apartamento_frontend  | nginx: master process started with pid ...
```

---

## ✅ VERIFICAR QUE FUNCIONA

```bash
# Terminal 1: Ver estado de containers
docker-compose ps

# Terminal 2: Probar backend
curl http://localhost:3001/api/docs

# Terminal 3: Probar frontend
open http://localhost:3000

# Probar API
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","fullName":"Test"}'
```

---

## 🛑 PARAR SERVICIOS

```bash
# Parar containers (sin eliminar volúmenes)
docker-compose stop

# Parar y eliminar containers
docker-compose down

# Eliminar todo incluyendo volúmenes (⚠️ CUIDADO CON DATOS)
docker-compose down -v
```

---

## 📊 COMANDOS ÚTILES

```bash
# Ver logs en tiempo real
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Acceder a shell del container
docker-compose exec backend sh
docker-compose exec postgres psql -U apartamento_user -d apartamento_airbnb

# Rebuild específico
docker-compose build backend --no-cache

# Ejecutar migrations
docker-compose exec backend npm run migration:run

# Ejecutar seeds
docker-compose exec backend npm run seed
```

---

## 🔄 CI/CD CON GITHUB ACTIONS

Crea `.github/workflows/docker-build.yml`:

```yaml
name: Docker Build & Push

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: ${{ github.event_name != 'pull_request' }}
          tags: ghcr.io/${{ github.repository }}/backend:latest

      - name: Build and push Frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: ${{ github.event_name != 'pull_request' }}
          tags: ghcr.io/${{ github.repository }}/frontend:latest
```

---

## ☁️ DEPLOYMENT A HEROKU

```bash
# 1. Instalar Heroku CLI
# macOS: brew tap heroku/brew && brew install heroku
# Linux: curl https://cli-assets.heroku.com/install.sh | sh

# 2. Login
heroku login

# 3. Crear app
heroku create apartamento-app

# 4. Agregar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev -a apartamento-app

# 5. Setear variables de entorno
heroku config:set JWT_SECRET=your-secret-key -a apartamento-app
heroku config:set DB_PASSWORD=your-db-password -a apartamento-app

# 6. Deploy
git push heroku main

# 7. Ver logs
heroku logs --tail -a apartamento-app

# 8. Abrir app
heroku open -a apartamento-app
```

---

## 🔐 PRODUCCIÓN - CHECKLIST

- [ ] Cambiar JWT_SECRET a valor seguro
- [ ] Cambiar DB_PASSWORD a valor seguro
- [ ] Configurar CORS_ORIGIN al dominio correcto
- [ ] Habilitar HTTPS/SSL
- [ ] Configurar backups automáticos
- [ ] Configurar monitoreo
- [ ] Configurar alertas
- [ ] Ejecutar security scan
- [ ] Performance testing
- [ ] Load testing

---

## 🆘 TROUBLESHOOTING

### "Connection refused" en backend
```bash
# Verificar que postgres está listo
docker-compose logs postgres

# Esperar más tiempo para que postgres inicie
docker-compose restart backend
```

### "Cannot connect to database"
```bash
# Verificar variables de entorno
docker-compose config | grep DB_

# Revisar logs
docker-compose logs postgres
```

### "Port already in use"
```bash
# Cambiar puerto en docker-compose.yml
# O liberar el puerto
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5432
```

### "Build fails"
```bash
# Limpiar cache
docker-compose build --no-cache

# Ver log completo
docker-compose build backend --progress=plain
```

---

## 📚 RECURSOS

- Docker Docs: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose
- GitHub Actions: https://github.com/features/actions
- Heroku: https://www.heroku.com

---

**Siguiente Paso:** Ejecutar `docker-compose up` y verificar que todo funciona 🚀

