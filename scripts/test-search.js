// Quick test for the fetch-based DuckDuckGo search
const cheerio = require("cheerio");

async function searchDuckDuckGo(query) {
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  const response = await fetch(searchUrl, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo search failed: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const results = [];

  $(".result").each((_, element) => {
    const linkEl = $(element).find(".result__a");
    const snippetEl = $(element).find(".result__snippet");

    const href = linkEl.attr("href");
    if (!href) return;

    try {
      // DuckDuckGo uses redirect URLs, extract the actual URL
      const urlMatch = href.match(/uddg=([^&]+)/);
      const actualUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : href;

      // Skip DuckDuckGo redirect/ad URLs
      if (actualUrl.includes("duckduckgo.com")) {
        return;
      }

      const urlObj = new URL(actualUrl);
      results.push({
        title: linkEl.text().trim(),
        url: actualUrl,
        snippet: snippetEl.text().trim().slice(0, 100) + "...",
        domain: urlObj.hostname.replace("www.", ""),
      });
    } catch {
      // Invalid URL, skip
    }
  });

  return results;
}

async function main() {
  console.log("Testing DuckDuckGo search with fetch + cheerio...\n");

  const query = "dna software";
  console.log(`Query: "${query}"`);
  console.log("---");

  const results = await searchDuckDuckGo(query);

  console.log(`Found ${results.length} results:\n`);

  results.slice(0, 5).forEach((r, i) => {
    console.log(`${i + 1}. ${r.title}`);
    console.log(`   URL: ${r.url}`);
    console.log(`   Domain: ${r.domain}`);
    console.log(`   Snippet: ${r.snippet}`);
    console.log("");
  });
}

main().catch(console.error);
