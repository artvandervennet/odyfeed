FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@10

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build the app
RUN pnpm build

# Expose the port that Cloud Run expects
EXPOSE 8080

# Start the app - Cloud Run requires the app to listen on PORT env variable (default 8080)
CMD ["node", ".output/server/index.mjs"]

