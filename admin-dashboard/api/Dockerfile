# Backend Dockerfile — Production-ready NestJS container
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production && npx prisma generate
COPY --from=builder /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]


# Build:  docker build -t abu-bishar-api .
# Run:    docker run -p 3000:3000 --env-file .env abu-bishar-api
# Push:   docker tag abu-bishar-api registry.abu-bishar.com/api
#         docker push registry.abu-bishar.com/api
