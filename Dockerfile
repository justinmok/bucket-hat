# syntax=docker/dockerfile:1
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --silent

COPY . .

RUN npx tsc -p ./tsconfig.json

CMD ["npm", "start"]
