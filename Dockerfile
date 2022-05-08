# FROM node:18-bullseye-slim

FROM ubuntu:20.04

RUN apt-get update && apt-get install -y curl

# https://github.com/nodesource/distributions#readme
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

RUN npm install -g yarn

ADD . .

RUN yarn install
