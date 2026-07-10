# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build the project
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled code from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port (adjust if app uses a different port)
EXPOSE 3000

# Set the environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Start the backend server
CMD ["npm", "start"]
