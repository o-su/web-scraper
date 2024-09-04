"use strict";
const express = require("express");

const Crawler = require("./crawler.js");
const Logger = require("./logger.js");
require("dotenv").config();

const app = express();
const port = 3500;

// TODO: detect concurrent requests and stop recording
app.get("/", async (req, res) => {
  const { DEBUG, SAME_ORIGIN_ONLY } = process.env;
  const debug = DEBUG === "true";
  const sameOriginOnly = SAME_ORIGIN_ONLY === "true";
  const targetUrl = req.query["targetUrl"];

  if (!targetUrl || targetUrl === "") {
    res.status(422).send({ error: "Invalid target URL" });
    return;
  }

  let result = {};
  const logger = new Logger();
  const crawler = new Crawler(logger);

  try {
    result = await crawler.crawl(targetUrl, debug, sameOriginOnly);
  } catch (error) {
    logger.logError(error);
  }

  res.send({
    ...result,
    logs: logger.getLogs(),
  });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
