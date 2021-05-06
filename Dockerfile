FROM jrottenberg/ffmpeg:3.3-alpine

FROM nikolaik/python-nodejs:python3.7-nodejs14-alpine

WORKDIR /usr/src/app
COPY --from=0 / /

COPY package*.json ./

RUN apk add --no-cache --virtual .build-deps make gcc g++ automake autoconf libtool pixman cairo build-base cairo-dev    cairo-tools pango jpeg-dev zlib-dev freetype-dev lcms2-dev openjpeg-dev tiff-dev tk-dev tcl-dev
RUN npm install --silent
RUN npm install -g typescript
RUN apk del .build-deps

COPY . .

RUN tsc -p ./tsconfig.json

CMD ["npm", "start"]
# todo: healthcheck