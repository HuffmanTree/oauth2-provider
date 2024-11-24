# oauth2-provider

Simple Oauth2 / OpenID Connect provider

## Installation

Clone the project and install dependencies

```sh
git clone git@github.com:HuffmanTree/oauth2-provider.git
cd oauth2-provider
nvm i # to make sure the correct version of NodeJS is installed
npm i && npm run build
```

## Run development environment

Spawn the database with `docker-compose`

```sh
docker compose -f server/docker/docker-compose.yml up db
```

Generate RSA keypair to sign and verify authentication tokens

```sh
cd server
./regenerate-keys.sh
```

Run the front and the back of this monorepo with one command from the root folder

```sh
npm run dev
```

## Run tests

Launch unit tests with the following command (server only for now)

```sh
npm run test
```
