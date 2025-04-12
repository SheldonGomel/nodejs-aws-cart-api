# Stage 1: Build
FROM docker.io/library/node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build-webpack

# Stage 2: Production
FROM docker.io/library/node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist/main.js ./dist/main.js
ENV APP_PORT=8080
EXPOSE 8080
CMD ["node","./dist/main.js"]