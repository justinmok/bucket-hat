FROM jrottenberg/ffmpeg:3.3-alpine

FROM nikolaik/python-nodejs:python3.7-nodejs14-alpine

WORKDIR /usr/src/app
COPY --from=0 / /

COPY package*.json ./

ENV LD_PRELOAD=/usr/lib/libfreetype.so

RUN apk add --no-cache make gcc g++ build-base automake autoconf libtool cairo-dev \
    jpeg-dev \
    pango-dev \ 
    giflib-dev \
    fontconfig \
    freetype-dev \
    fribidi

RUN npm install canvas
RUN npm install --silent --build-from-source
RUN npm install -g typescript node-gyp
#RUN apk del .build-deps

COPY . .

# delete problem line
RUN sed -i '8d' node_modules/chartjs-node-canvas/dist/index.d.ts
RUN tsc -p ./tsconfig.json

CMD ["npm", "start"]
# todo: healthcheck