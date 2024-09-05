const playwright = require("playwright");

module.exports = class Crawler {
  constructor(logger) {
    this.logger = logger;
  }

  crawl = async (url, debug) => {
    const targetUrl = this.enforceTrailingSlash(url);

    try {
      const browser = await playwright.chromium.launch({
        headless: !debug,
      });

      const page = await browser.newPage();

      await page.goto(targetUrl);

      this.mimicScroll(0);

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

  mimicScroll = async (initialScrollPosition) => {
    const timeout = Math.floor(Math.random() * 2000) + 50;
    const scrollPosition =
      initialScrollPosition + Math.floor(Math.random() * 25) + 5;

    this.scroll(scrollPosition);

    setTimeout(() => {
      this.mimicScroll(scrollPosition);
    }, timeout);
  };

  scroll = async (yScroll) => {
    if (this.page) {
      await this.page.mouse.wheel(0, yScroll);
    }
  };
};
