# oauth2-provider

Simple Oauth2 / OpenID Connect provider

## Installation

Clone the project and install dependencies

```sh
git clone git@github.com:HuffmanTree/oauth2-provider.git
nvm i # to make sure the correct version of NodeJS is installed
npm i
```

## Run development environment

Spawn the database with `docker-compose`

```sh
docker compose -f server/docker/docker-compose.yml up db
```

Run the front and the back of this monorepo with one command

```sh
npm run dev
```

## Run tests

Launch unit tests with the following command (server only for now)

```sh
npm run test
```
