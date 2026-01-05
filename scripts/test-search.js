// Quick test for the Serper.dev Google search API
// Run with: SERPER_API_KEY=your-key node scripts/test-search.js

async function searchGoogle(query) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "SERPER_API_KEY environment variable is required. Sign up at https://serper.dev"
    );
  }

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      num: 10,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Serper API failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  return (data.organic || []).map((item) => {
    const urlObj = new URL(item.link);
    return {
      title: item.title,
      url: item.link,
      snippet: (item.snippet || "").slice(0, 100) + "...",
      domain: urlObj.hostname.replace("www.", ""),
    };
  });
}

async function main() {
  console.log("Testing Serper.dev Google search API...\n");

  const query = "dna software";
  console.log(`Query: "${query}"`);
  console.log("---");

  const results = await searchGoogle(query);

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
