# Usamos una imagen ligera de Node.js
FROM node:20-alpine

# Creamos el directorio de trabajo
WORKDIR /usr/src/app

# Copiamos los archivos de dependencias primero para aprovechar el cache de Docker
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto que usa NestJS
EXPOSE 3000

# Comando para iniciar en modo desarrollo con watch
CMD ["npm", "run", "start:dev"]