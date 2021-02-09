FROM jrottenberg/ffmpeg:3.3-alpine

FROM nikolaik/python-nodejs:python3.7-nodejs14-alpine

WORKDIR /usr/src/app
COPY --from=0 / /

COPY package*.json ./

RUN apk add --no-cache --virtual .build-deps make gcc g++
RUN npm install --silent
RUN apk del .build-deps

COPY . .

CMD ["node", "index.js"]