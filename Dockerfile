# Use the official Node.js LTS image (use specific version for consistency and security)
FROM arepo.kasbinozone.ir/node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Expose port (change if needed)
EXPOSE 3000

# Use non-root user for security (optional but recommended)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the app
CMD ["node", "server.js"]
