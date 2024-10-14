const playwright = require("playwright");

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.2227.0 Safari/537.36";

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
      const context = await browser.newContext({ userAgent });

      await this.disableAutomationFlags(context);

      const page = await context.newPage();

      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });

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

        await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
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
      const scrollId = this.mimicScroll(page, 0);
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

      this.clearScroll(scrollId);

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
    const delay = Math.floor(Math.random() * 2000) + 50;
    const scrollPosition =
      initialScrollPosition + Math.floor(Math.random() * 25) + 5;

    const timeoutId = setTimeout(() => {
      this.scroll(page, scrollPosition);
    }, delay);

    return timeoutId;
  };

  clearScroll = (scrollId) => clearTimeout(scrollId);

  scroll = async (page, yScroll) => {
    if (page) {
      await page.mouse.wheel(0, yScroll);
    }
  };

  disableAutomationFlags = async (context) => {
    await context.addInitScript(
      "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    );
  };
};
