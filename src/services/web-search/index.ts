// Web Search Service
// Uses Puppeteer to search DuckDuckGo and extract results
// (DuckDuckGo is used instead of Google because Google blocks automated searches with CAPTCHA)

import puppeteer from "puppeteer";

export interface SearchResult {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

export interface WebSearchOptions {
  maxResults?: number;
  timeout?: number;
}

/**
 * Search DuckDuckGo HTML and extract organic results
 * Uses the HTML version which is more scraping-friendly
 */
export async function searchGoogle(
  query: string,
  options: WebSearchOptions = {}
): Promise<SearchResult[]> {
  const { maxResults = 20, timeout = 30000 } = options;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Use DuckDuckGo HTML search (more stable, no JavaScript required)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, {
      waitUntil: "networkidle2",
      timeout,
    });

    // Extract search results
    const results = await page.evaluate(() => {
      const items: Array<{
        title: string;
        url: string;
        domain: string;
        snippet: string;
      }> = [];

      const resultElements = document.querySelectorAll(".result");
      resultElements.forEach((el) => {
        const linkEl = el.querySelector(".result__a") as HTMLAnchorElement;
        const snippetEl = el.querySelector(".result__snippet");

        if (linkEl && linkEl.href) {
          try {
            const url = linkEl.href;
            // DuckDuckGo uses redirect URLs, extract the actual URL
            const urlMatch = url.match(/uddg=([^&]+)/);
            const actualUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : url;

            // Skip DuckDuckGo redirect/ad URLs that don't resolve to real sites
            if (actualUrl.includes("duckduckgo.com")) {
              return;
            }

            const urlObj = new URL(actualUrl);
            items.push({
              title: linkEl.textContent?.trim() || "",
              url: actualUrl,
              snippet: snippetEl?.textContent?.trim() || "",
              domain: urlObj.hostname.replace("www.", ""),
            });
          } catch {
            // Invalid URL, skip
          }
        }
      });

      return items;
    });

    return results.slice(0, maxResults);
  } finally {
    await browser.close();
  }
}

/**
 * Generate search queries for finding companies with inferior domains
 * Searches for companies in the space that may be using non-.com domains
 */
export function generateUpgradeSearchQueries(domainName: string): string[] {
  const queries: string[] = [];

  // Split camelCase to get keywords
  const words = domainName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();
  const keywordPhrase = words.split(/\s+/).filter((w) => w.length > 2).join(" ");

  // Search for companies using common prefix patterns
  queries.push(`"get${domainName}" OR "try${domainName}" OR "use${domainName}"`);

  // Search for companies using alternate TLDs
  queries.push(`"${domainName}.io" OR "${domainName}.co" OR "${domainName}.ai"`);

  // Search for hyphenated versions (e.g., weather-robots instead of weatherrobots)
  if (words.includes(" ")) {
    const hyphenated = words.replace(/\s+/g, "-");
    queries.push(`"${hyphenated}" site:.com`);
  }

  // Search for companies in the space that may want the premium .com
  queries.push(`${keywordPhrase} company -"${domainName}.com"`);
  queries.push(`${keywordPhrase} startup website`);
  queries.push(`${keywordPhrase} brand new company`);

  return queries;
}

/**
 * Generate search queries for finding SEO/PPC competitors
 */
export function generateSEOSearchQueries(domainName: string): string[] {
  // Split camelCase to get keywords
  const words = domainName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const keywordPhrase = words.join(" ");

  return [
    keywordPhrase,
    `${keywordPhrase} software`,
    `${keywordPhrase} platform`,
    `${keywordPhrase} company`,
    `${keywordPhrase} startup`,
    `best ${keywordPhrase}`,
  ];
}

/**
 * Generate search queries for finding emerging startups
 */
export function generateStartupSearchQueries(domainName: string): string[] {
  const words = domainName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const keywordPhrase = words.join(" ");

  return [
    `${keywordPhrase} startup`,
    `${keywordPhrase} site:producthunt.com`,
    `${keywordPhrase} site:crunchbase.com`,
    `${keywordPhrase} "series a" OR "seed funding"`,
    `${keywordPhrase} YC OR "Y Combinator"`,
  ];
}

/**
 * Deduplicate results by domain
 */
export function deduplicateByDomain(results: SearchResult[]): SearchResult[] {
  const seen = new Map<string, SearchResult>();

  for (const result of results) {
    if (!seen.has(result.domain)) {
      seen.set(result.domain, result);
    }
  }

  return Array.from(seen.values());
}

/**
 * Filter out irrelevant results (social media, news, directories, etc.)
 * These sites won't have useful contact info for sales outreach
 */
export function filterResults(results: SearchResult[]): SearchResult[] {
  const blockedDomains = [
    // Social media
    "facebook.com",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "instagram.com",
    "pinterest.com",
    "reddit.com",
    "tiktok.com",
    "threads.net",
    // News and media
    "cnn.com",
    "bbc.com",
    "nytimes.com",
    "washingtonpost.com",
    "theguardian.com",
    "reuters.com",
    "apnews.com",
    "bloomberg.com",
    "forbes.com",
    "businessinsider.com",
    "techcrunch.com",
    "theverge.com",
    "wired.com",
    "arstechnica.com",
    "engadget.com",
    "mashable.com",
    "venturebeat.com",
    "zdnet.com",
    "cnet.com",
    "gizmodo.com",
    "inc.com",
    "fastcompany.com",
    "fortune.com",
    "huffpost.com",
    "huffingtonpost.com",
    "news.yahoo.com",
    "news.google.com",
    "msn.com",
    "foxnews.com",
    "foxweather.com",
    "weather.com",
    "interestingengineering.com",
    "financialcontent.com",
    "newsfilecorp.com",
    "prnewswire.com",
    "globenewswire.com",
    "businesswire.com",
    // Research and academic
    "wikipedia.org",
    "arxiv.org",
    "nature.com",
    "science.org",
    "ieee.org",
    "acm.org",
    "researchgate.net",
    "academia.edu",
    "scholar.google.com",
    "deepmind.google",
    "research.google",
    "ai.google",
    "research.microsoft.com",
    "research.facebook.com",
    "openai.com",
    // E-commerce and retail
    "amazon.com",
    "ebay.com",
    "walmart.com",
    "target.com",
    "barnesandnoble.com",
    "bestbuy.com",
    "newegg.com",
    "aliexpress.com",
    "alibaba.com",
    "etsy.com",
    "shopify.com",
    // Job boards and reviews
    "glassdoor.com",
    "indeed.com",
    "monster.com",
    "ziprecruiter.com",
    "yelp.com",
    "trustpilot.com",
    "bbb.org",
    "craigslist.org",
    // Developer and tech
    "github.com",
    "gitlab.com",
    "bitbucket.org",
    "stackoverflow.com",
    "stackexchange.com",
    "npmjs.com",
    "pypi.org",
    "docs.google.com",
    "drive.google.com",
    "colab.research.google.com",
    // Content platforms
    "medium.com",
    "substack.com",
    "quora.com",
    "wordpress.com",
    "blogger.com",
    "tumblr.com",
    "youtube.com",
    "vimeo.com",
    // Directories and aggregators
    "crunchbase.com",
    "pitchbook.com",
    "owler.com",
    "zoominfo.com",
    "dnb.com",
    "hoovers.com",
    "manta.com",
    "yellowpages.com",
    "whitepages.com",
    "seedtable.com",
    "tracxn.com",
    "ventureradar.com",
    "startus-insights.com",
    "climatesort.com",
    "ai-startups.pro",
    "reportsanddata.com",
    "researchandmarkets.com",
    // Podcasts and media hosting
    "spotify.com",
    "apple.com",
    "soundcloud.com",
    "anchor.fm",
    // Government
    "gov",
    "noaa.gov",
    ".edu",
  ];

  return results.filter((r) => {
    const domainLower = r.domain.toLowerCase();
    return !blockedDomains.some((blocked) => domainLower.includes(blocked));
  });
}
