#!/usr/bin/bash

mkdir -p resources/keys
rm -f resources/keys/*
ssh-keygen -t rsa -b 4096 -m PEM -f ./resources/keys/rsa.key -N ""
openssl rsa -in ./resources/keys/rsa.key -pubout -outform PEM -out ./resources/keys/rsa.key.pub
