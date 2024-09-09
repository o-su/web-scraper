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

curl -X POST http://localhost:3500/api/scrape -H "Content-Type: application/json" -d {\"targetUrl\":\"https://www.seznam.cz/\"}

## Maintenance

- update playwright docker image: mcr.microsoft.com/playwright:v1.46.1-jammy
- update local playwright: `npx playwright install`
