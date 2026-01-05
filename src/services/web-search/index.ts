// Web Search Service
// Uses fetch + cheerio to search DuckDuckGo and extract results
// (DuckDuckGo is used instead of Google because Google blocks automated searches with CAPTCHA)

import * as cheerio from "cheerio";

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
 * Uses fetch + cheerio for reliable serverless execution
 */
export async function searchGoogle(
  query: string,
  options: WebSearchOptions = {}
): Promise<SearchResult[]> {
  const { maxResults = 20, timeout = 30000 } = options;

  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo search failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const results: SearchResult[] = [];

    $(".result").each((_, element) => {
      const linkEl = $(element).find(".result__a");
      const snippetEl = $(element).find(".result__snippet");

      const href = linkEl.attr("href");
      if (!href) return;

      try {
        // DuckDuckGo uses redirect URLs, extract the actual URL
        const urlMatch = href.match(/uddg=([^&]+)/);
        const actualUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : href;

        // Skip DuckDuckGo redirect/ad URLs that don't resolve to real sites
        if (actualUrl.includes("duckduckgo.com")) {
          return;
        }

        const urlObj = new URL(actualUrl);
        results.push({
          title: linkEl.text().trim(),
          url: actualUrl,
          snippet: snippetEl.text().trim(),
          domain: urlObj.hostname.replace("www.", ""),
        });
      } catch {
        // Invalid URL, skip
      }
    });

    return results.slice(0, maxResults);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Generate search queries for finding companies with inferior domains
 * Searches for companies in the space that may be using non-.com domains
 */
export function generateUpgradeSearchQueries(domainName: string): string[] {
  const queries: string[] = [];

  // Split camelCase to get keywords, but always include the full domain name
  const words = domainName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();

  // Use the full domain name as keyword phrase, regardless of length
  // Only filter out very short words (1-2 chars) if there are longer words available
  const wordList = words.split(/\s+/);
  const longWords = wordList.filter((w) => w.length > 2);
  const keywordPhrase = longWords.length > 0 ? longWords.join(" ") : words.trim();

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
  if (keywordPhrase) {
    queries.push(`${keywordPhrase} company -"${domainName}.com"`);
    queries.push(`${keywordPhrase} startup website`);
    queries.push(`${keywordPhrase} brand new company`);
  }

  return queries;
}

/**
 * Generate search queries for finding SEO/PPC competitors
 */
export function generateSEOSearchQueries(domainName: string): string[] {
  // Split camelCase to get keywords, preserving short domain names
  const words = domainName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();

  // Use the full domain name as keyword, falling back to original if all words are short
  const wordList = words.split(/\s+/);
  const longWords = wordList.filter((w) => w.length > 2);
  const keywordPhrase = longWords.length > 0 ? longWords.join(" ") : domainName.toLowerCase();

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
  // Split camelCase to get keywords, preserving short domain names
  const words = domainName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();

  // Use the full domain name as keyword, falling back to original if all words are short
  const wordList = words.split(/\s+/);
  const longWords = wordList.filter((w) => w.length > 2);
  const keywordPhrase = longWords.length > 0 ? longWords.join(" ") : domainName.toLowerCase();

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
