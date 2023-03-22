# syntax=docker/dockerfile:1

#Version node
FROM node:19.6.0
#FROM node:18.13.0

WORKDIR /app

COPY package*.json ./
COPY . .

RUN ls -a
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]

