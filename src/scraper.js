const playwright = require("playwright");

module.exports = class Scraper {
  constructor(logger) {
    this.logger = logger;
  }

  scrape = async (url, debug) => {
    const targetUrl = this.enforceTrailingSlash(url);
    const page = await this.downloadPage(targetUrl, debug);

    if (page) {
      return this.scrapeWeb(page, targetUrl);
    } else {
      return {};
    }
  };

  downloadPage = async (targetUrl, debug) => {
    try {
      const browser = await playwright.chromium.launch({
        headless: !debug,
      });

      const page = await browser.newPage();

      await page.goto(targetUrl);
    } catch (error) {
      this.logger.logError(error.message);
      console.log(error.message);
      return undefined;
    }
  };

  scrapeWeb = async (page, targetUrl) => {
    try {
      this.mimicScroll(page, 0);

      const htmlLinks = await page.getByRole("link").all();
      const links = [];

      for (const link of htmlLinks) {
        const href = this.enforceAbsoluteUrl(
          await link.getAttribute("href"),
          targetUrl
        );

        if (!links.some((l) => l.href === href)) {
          links.push({ href, label: await link.textContent() });
        }
      }

      const content = await page.evaluate(() => {
        return document.body.innerText; // Gets only the visible text
      });

      return {
        content,
        links,
      };
    } catch (error) {
      this.logger.logError(error.message);
      console.log(error.message);
      return {};
    }
  };

  enforceAbsoluteUrl = (url, base) => {
    if (url.startsWith("/")) {
      const urlWithoutLeadingSlash = url.startsWith("/")
        ? url.substring(1)
        : url;

      return base + urlWithoutLeadingSlash;
    } else {
      return url;
    }
  };

  enforceTrailingSlash = (url) => {
    if (url.endsWith("/")) {
      return url;
    } else {
      return url + "/";
    }
  };

  mimicScroll = async (page, initialScrollPosition) => {
    const timeout = Math.floor(Math.random() * 2000) + 50;
    const scrollPosition =
      initialScrollPosition + Math.floor(Math.random() * 25) + 5;

    this.scroll(page, scrollPosition);

    setTimeout(() => {
      this.mimicScroll(page, scrollPosition);
    }, timeout);
  };

  scroll = async (page, yScroll) => {
    if (page) {
      await page.mouse.wheel(0, yScroll);
    }
  };
};
