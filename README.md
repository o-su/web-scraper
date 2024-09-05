# web scraper

## Installation

```ini
# .env
DEBUG=false
```

`docker-compose build`
`docker-compose up`

## Development

```ini
# .env
DEBUG=true
```

`npm run start`

## Usage

open in browser: http://localhost:3500/?targetUrl=https://www.target.com/
results will be saved in ./results folder

## Maintenance

- update playwright docker image: mcr.microsoft.com/playwright:v1.46.1-jammy
- update local playwright: `npx playwright install`
