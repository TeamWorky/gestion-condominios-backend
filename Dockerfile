# Development stage
FROM node:24.11.1-alpine as dev

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]

# Development dependencies stage
FROM node:24.11.1-alpine as dev-deps

WORKDIR /app

COPY package*.json ./

RUN npm ci || npm install

# Builder stage
FROM node:24.11.1-alpine as builder

WORKDIR /app

COPY --from=dev-deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

# Production dependencies stage
FROM node:24.11.1-alpine as prod-deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production || npm install --production

# Production stage
FROM node:24.11.1-alpine as prod

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Copy production dependencies and built files
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --chown=nestjs:nodejs package.json ./

# Switch to non-root user
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main.js"]
