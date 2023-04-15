# syntax=docker/dockerfile:1

#Version node
FROM node:lts-alpine3.17

WORKDIR /app

COPY package*.json ./
COPY . .

RUN ls -a
RUN npm install

CMD ["node", "client.js"]

