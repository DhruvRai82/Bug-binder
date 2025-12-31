FROM node:20-alpine

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies (using legacy-peer-deps due to conflicts)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Start command: Run only frontend script and bind to all interfaces
CMD ["npm", "run", "dev:frontend", "--", "--host"]
