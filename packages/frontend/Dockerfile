# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (use --no-frozen-lockfile if lockfile is not present)
RUN sh -lc "if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install --no-frozen-lockfile; fi"

# Copy source
COPY . .

# Ensure tsc is available (in case devDependencies weren't installed in the build context)
# Build
 # Ensure typescript is installed locally so `tsc` resolves to /app/node_modules/typescript
 RUN pnpm add -D typescript

 # Build
 RUN pnpm build

# Production stage with nginx
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
