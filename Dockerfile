FROM nodesource/nsolid:boron-latest

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ENV NODE_ENV production

RUN ["npm", "install", "nsolid-statsd"]

ENTRYPOINT ["node_modules/.bin/nsolid-statsd"]
