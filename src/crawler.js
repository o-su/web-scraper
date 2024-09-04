const playwright = require("playwright");

module.exports = class Crawler {
  constructor(logger) {
    this.logger = logger;
  }

  crawl = async (url, debug) => {
    const targetUrl = this.enforceTrailingSlash(url);

    if (!this.browser) {
      this.browser = await playwright.chromium.launch({
        headless: !debug,
      });
    }

    if (!this.page) {
      this.page = await this.browser.newPage();
    }

    try {
      await this.page.goto(targetUrl);
    } catch (error) {
      this.logger.log(error);
    }

    this.mimicScroll(0);

    const htmlLinks = await this.page.getByRole("link").all();
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

    const content = await this.page.evaluate(() => {
      return document.body.innerText; // Gets only the visible text
    });

    return {
      content,
      links,
    };
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
