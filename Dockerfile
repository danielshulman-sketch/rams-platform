# Base image
FROM node:18-alpine

# Working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
# Using --legacy-peer-deps to avoid conflicts if any
RUN npm install --legacy-peer-deps

# Copy source code
COPY backend/ .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "start:prod"]
