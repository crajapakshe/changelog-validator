FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

#WORKDIR /workspace
ENTRYPOINT ["node", "/app/cli.js"]