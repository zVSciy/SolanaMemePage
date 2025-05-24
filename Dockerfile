# Use Node.js LTS version
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
RUN npm install --save-dev webpack webpack-cli webpack-dev-server

COPY . .

RUN mkdir -p src/assets

RUN npm run build

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9000 || exit 1

CMD ["npm", "run", "dev"]
