FROM mcr.microsoft.com/playwright:v1.46.1-jammy
RUN apt-get update && apt-get install build-essential -y

WORKDIR /

COPY package.json /
COPY src /src/
COPY playwright.config.ts /

RUN npm install