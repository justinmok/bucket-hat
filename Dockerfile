FROM jrottenberg/ffmpeg:3.3-alpine

FROM nikolaik/python-nodejs:python3.7-nodejs14-alpine

WORKDIR /usr/src/app
COPY --from=0 / /

COPY package*.json ./

RUN apk add --no-cache --virtual .build-deps make gcc g++ build-base automake autoconf libtool

RUN apk add --no-cache --virtual build-deps \
      cairo-dev \
      jpeg-dev \
      pango-dev \
      musl-dev \
      giflib-dev \
      pixman-dev \
      pangomm-dev \
      libjpeg-turbo-dev \
      freetype-dev \
    && npm ci \
    && apk del build-deps \
    && apk add --no-cache \
      cairo \
      jpeg \
      pango \
      musl \
      giflib \
      pixman \
      pangomm \
      fontconfig \
      libjpeg-turbo \
      freetype

RUN npm install --silent --build-from-source
RUN npm install -g typescript node-gyp
RUN apk del .build-deps

COPY . .

# delete problem line
RUN sed -i '8d' node_modules/chartjs-node-canvas/dist/index.d.ts
RUN tsc -p ./tsconfig.json

CMD ["npm", "start"]
# todo: healthcheck