# =============================================================================
# LodgeFlow Frontend — Node 20 + Vite dev server
# =============================================================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies (if package.json exists)
# On first run before frontend is scaffolded, this will be a no-op
RUN if [ -f package.json ]; then npm ci; fi

# Expose Vite dev server port
EXPOSE 5173

# Default command: run Vite dev server with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
