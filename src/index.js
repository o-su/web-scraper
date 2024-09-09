"use strict";
const express = require("express");

const Scraper = require("./scraper.js");
const Logger = require("./logger.js");
require("dotenv").config();

const app = express();
const port = 3500;

app.use(express.json({ strict: true }));

app.post("/api/scrape", async (req, res) => {
  const { DEBUG } = process.env;
  const debug = DEBUG === "true";
  const { targetUrl } = req.body;

  if (!targetUrl || targetUrl === "") {
    res.status(422).send({ error: "Invalid target URL" });
    return;
  }

  const logger = new Logger();
  const scraper = new Scraper(logger);
  const result = await scraper.scrape(targetUrl, debug);

  res.json({
    ...result,
    logs: logger.getLogs(),
  });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
