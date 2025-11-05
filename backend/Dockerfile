# Dockerfile para Backend

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY backend/src ./src
COPY backend/tsconfig.json .

# Build
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
