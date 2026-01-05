// Web Search Service
// Uses Brave Search API - Free tier: 2,000 queries/month
// Sign up at https://brave.com/search/api/

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

interface BraveWebResult {
  title: string;
  url: string;
  description: string;
}

interface BraveSearchResponse {
  web?: {
    results: BraveWebResult[];
  };
}

/**
 * Search via Brave Search API
 * Requires BRAVE_SEARCH_API_KEY environment variable
 * Free tier: 2,000 queries/month
 */
export async function searchGoogle(
  query: string,
  options: WebSearchOptions = {}
): Promise<SearchResult[]> {
  const { maxResults = 20, timeout = 30000 } = options;

  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error(
      "BRAVE_SEARCH_API_KEY environment variable is required. Sign up at https://brave.com/search/api/ (free: 2,000 queries/month)"
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const params = new URLSearchParams({
      q: query,
      count: String(Math.min(maxResults, 20)), // Brave max is 20 per request
    });

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params}`,
      {
        method: "GET",
        headers: {
          "X-Subscription-Token": apiKey,
          Accept: "application/json",
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brave Search API failed: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as BraveSearchResponse;

    const results: SearchResult[] = [];

    for (const item of data.web?.results || []) {
      try {
        const urlObj = new URL(item.url);
        results.push({
          title: item.title,
          url: item.url,
          snippet: item.description || "",
          domain: urlObj.hostname.replace("www.", ""),
        });
      } catch {
        // Invalid URL, skip
      }
    }

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
