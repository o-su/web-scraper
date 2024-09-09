const playwright = require("playwright");

module.exports = class Scraper {
  constructor(logger) {
    this.logger = logger;
  }

  scrape = async (url, debug) => {
    const targetUrl = this.enforceTrailingSlash(url);
    const { page, browser } = await this.downloadPage(targetUrl, debug);

    if (page) {
      const result = await this.scrapeWeb(page, targetUrl);

      await browser.close();

      return result;
    } else {
      await browser.close();

      return {};
    }
  };

  scrapeBatch = async (urls, debug) => {
    const results = {};
    const targetUrls = urls.map((url) => this.enforceTrailingSlash(url));
    const { pages, browser } = await this.downloadPages(targetUrls, debug);

    for (let index = 0; index < pages.length; index++) {
      const page = pages[index];
      const targetUrl = targetUrls[index];

      if (page) {
        results[targetUrl] = await this.scrapeWeb(page, targetUrl);
      } else {
        results[targetUrl] = {};
      }
    }

    await browser.close();

    return results;
  };

  downloadPage = async (targetUrl, debug) => {
    try {
      const browser = await playwright.chromium.launch({
        headless: !debug,
      });

      const page = await browser.newPage();

      await page.goto(targetUrl);

      return { page, browser };
    } catch (error) {
      this.logger.logError(error.message);
      console.log(error.message);
      return { page: undefined, browser };
    }
  };

  downloadPages = async (targetUrls, debug) => {
    try {
      const browser = await playwright.chromium.launch({
        headless: !debug,
      });

      const pages = [];

      for (const targetUrl of targetUrls) {
        const page = await browser.newPage();

        await page.goto(targetUrl);
        pages.push(page);
      }

      return { pages, browser };
    } catch (error) {
      this.logger.logError(error.message);
      console.log(error.message);
      return { pages: [], browser };
    }
  };

  scrapeWeb = async (page, targetUrl) => {
    try {
      this.mimicScroll(page, 0);

      const htmlLinks = await page.getByRole("link").all();
      const links = [];

      for (const link of htmlLinks) {
        const href = await link.getAttribute("href");
        const absoluteHref = href
          ? this.enforceAbsoluteUrl(href, targetUrl)
          : undefined;

        if (!links.some((l) => l.href === absoluteHref)) {
          links.push({ absoluteHref, label: await link.textContent() });
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

    setTimeout(() => {
      this.scroll(page, scrollPosition);
    }, timeout);
  };

  scroll = async (page, yScroll) => {
    if (page) {
      await page.mouse.wheel(0, yScroll);
    }
  };
};
