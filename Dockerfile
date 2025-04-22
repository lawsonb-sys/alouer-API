FROM node:20.5.1-alpine3.18 AS builder

WORKDIR /app

RUN apk add --no-cache openssl python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --include=dev

RUN npm install

COPY . .
RUN npm run build

FROM node:20.5.1-alpine3.18

WORKDIR /app

# Crée la structure de dossiers avec les bonnes permissions
RUN mkdir -p /app/uploads/profile && \
    chown -R node:node /app/uploads && \
    chmod -R 755 /app/uploads

# Installation des dépendances runtime
RUN apk add --no-cache openssl

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
#COPY --chown=node:node .env ./

# Définit l'utilisateur non-root
USER node

EXPOSE 3002
CMD ["node", "dist/main"]