FROM mcr.microsoft.com/playwright:v1.46.1-jammy

WORKDIR /

COPY package.json /
COPY src /src/
COPY playwright.config.ts /

RUN apt-get update && apt-get install build-essential -y
RUN npm install