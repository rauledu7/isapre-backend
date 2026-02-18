# 1. Etapa de construcción
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copiamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el código y construimos la app (genera la carpeta /dist)
COPY . .
RUN npm run build

# 2. Etapa de ejecución (Imagen final ligera)
FROM node:20-alpine
WORKDIR /usr/src/app

# Solo copiamos lo necesario para correr la app
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Render usa puertos dinámicos, NestJS escuchará el que le den
EXPOSE 8080

# Comando para PRODUCCIÓN
CMD ["npm", "run", "start:prod"]