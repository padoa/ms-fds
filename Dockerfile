FROM node:18-alpine as base

RUN apk add --no-cache --no-progress \
#  gnupg \
  bash
#  git \
#  curl \
#  libexecinfo \
#  openssl \
#  tzdata \
#  openssh

ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm set progress=false


# Dev image contains necessary tools to install and run the app in dev mode
FROM base as dev

ARG AZDO_NPM_REGISTRY_PULL_TOKEN

WORKDIR /data/opt/backend

COPY package.json yarn.lock .yarnrc.yml ./
COPY ./ci-tools/npm-registry/connect-to-npm-registry-ci.sh ./tools/connect-to-npm-registry-ci.sh
RUN ./tools/connect-to-npm-registry-ci.sh $AZDO_NPM_REGISTRY_PULL_TOKEN

COPY ./ci-tools/scripts/retry_command.sh ./ci-tools/scripts/retry_command.sh
RUN corepack enable
RUN npm run yarn:retry

# COPY ./scripts ./scripts
COPY ./src ./src
COPY ./config ./config
# COPY ./resources ./resources

EXPOSE 14873

CMD [ "npm", "run", "start:dev" ]


# Builder image builds the production ready app in the dist directory
FROM dev as builder

ARG AZDO_NPM_REGISTRY_PULL_TOKEN

WORKDIR /data/opt/backend

COPY tsconfig.json .

RUN npm run build

WORKDIR /data/opt/backend/dist

COPY package.json yarn.lock ./
COPY ./ci-tools/npm-registry/connect-to-npm-registry-ci.sh ./tools/connect-to-npm-registry-ci.sh
RUN ./tools/connect-to-npm-registry-ci.sh $AZDO_NPM_REGISTRY_PULL_TOKEN

# Remove typescript because yarn installed it even though it is in dev dependencies
RUN yarn remove typescript

COPY ./ci-tools/scripts/retry_command.sh ./ci-tools/scripts/retry_command.sh
RUN yarn plugin import workspace-tools
RUN npm run yarn:retry:production

# Dist image
FROM base as dist

WORKDIR /data/opt/backend

COPY --from=builder /data/opt/backend/config ./config
COPY --from=builder /data/opt/backend/resources ./resources
COPY --from=builder /data/opt/backend/dist /data/opt/backend
COPY --from=builder /data/opt/backend/tools/connect-to-npm-registry-ci.sh ./tools/connect-to-npm-registry-ci.sh
COPY --from=builder /data/opt/backend/scripts ./scripts
COPY --from=builder /data/opt/backend/src/migrations/statics ./migrations/statics

# Cleanup duplicated migration files that will try (and fail) to run
RUN find ./migrations \( -name "*.d.ts" -o -name "*.js.map" \) -exec rm {} \;

EXPOSE 14873

CMD [ "npm", "run", "start:compiled" ]
