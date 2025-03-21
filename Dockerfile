FROM node:22.13.1-alpine

ENV NODE_ENV=development

RUN npm install -g pnpm
WORKDIR /src
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

RUN pnpm prune --prod

FROM node:22.13.1-alpine

ENV NODE_ENV=production

RUN apk add --no-cache eudev && \
    mkdir -p /run/udev
ENV UDEV=1


WORKDIR /dist
COPY --from=0 /src/dist/* ./
COPY --from=0 /src/node_modules ./node_modules
VOLUME [ "/data" ]
ENV DOCKER=true

CMD ["node", "."]