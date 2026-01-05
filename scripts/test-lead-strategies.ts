/**
 * Test script for lead finding strategies
 * Tests each strategy for WeatherRobots.com to evaluate result quality
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

import {
  searchGoogle,
  generateUpgradeSearchQueries,
  generateSEOSearchQueries,
  generateStartupSearchQueries,
  filterResults,
  deduplicateByDomain,
} from "../src/services/web-search";
import {
  generateMarketLeaderTargets,
} from "../src/lib/lead-strategies";
import type { Domain } from "../src/types/database";

const TEST_DOMAIN: Partial<Domain> = {
  id: "test-id",
  name: "weatherrobots",
  tld: "com",
  full_domain: "weatherrobots.com",
  status: "available",
};

async function testStrategy(
  name: string,
  getQueries: () => string[],
  maxQueries: number = 4
) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`STRATEGY: ${name}`);
  console.log("=".repeat(60));

  const queries = getQueries().slice(0, maxQueries);
  console.log(`\nSearch queries (${queries.length}):`);
  queries.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));

  const allResults: Awaited<ReturnType<typeof searchGoogle>> = [];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`\nSearching [${i + 1}/${queries.length}]: "${query}"`);

    try {
      const results = await searchGoogle(query, {
        maxResults: 10,
        timeout: 25000,
      });
      console.log(`  → Found ${results.length} results`);
      allResults.push(...results);

      // Show first few results
      results.slice(0, 3).forEach((r) => {
        console.log(`    • ${r.domain}: ${r.title?.slice(0, 50)}...`);
      });

      // Delay between searches
      if (i < queries.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(`  → ERROR: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Process results
  const filtered = filterResults(allResults);
  const deduplicated = deduplicateByDomain(filtered);

  console.log(`\n--- RESULTS SUMMARY ---`);
  console.log(`Total raw results: ${allResults.length}`);
  console.log(`After filtering: ${filtered.length}`);
  console.log(`Unique companies: ${deduplicated.length}`);

  if (deduplicated.length > 0) {
    console.log(`\nTop companies found:`);
    deduplicated.slice(0, 10).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.domain}`);
      console.log(`     Title: ${r.title?.slice(0, 60)}${r.title && r.title.length > 60 ? "..." : ""}`);
      console.log(`     URL: ${r.url}`);
    });
  }

  return deduplicated;
}

async function testMarketLeaders() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`STRATEGY: Market Leaders`);
  console.log("=".repeat(60));

  const targets = generateMarketLeaderTargets(TEST_DOMAIN as Domain);

  console.log(`\nKeyword-based targets found: ${targets.length}`);

  if (targets.length > 0) {
    console.log(`\nCompanies:`);
    targets.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.name} (${t.category})`);
      console.log(`     URL: ${t.url}`);
    });
  }

  return targets;
}

async function main() {
  console.log("Testing Lead Finding Strategies for: WeatherRobots.com");
  console.log("Started at:", new Date().toLocaleTimeString());

  const results: Record<string, unknown[]> = {};

  // Test Market Leaders (no web search, instant)
  results["market-leaders"] = await testMarketLeaders();

  // Test Domain Upgrade
  results["domain-upgrade"] = await testStrategy(
    "Domain Upgrade",
    () => generateUpgradeSearchQueries("weatherrobots"),
    4
  );

  // Test SEO/PPC Bidders
  results["seo-bidders"] = await testStrategy(
    "SEO/PPC Bidders",
    () => generateSEOSearchQueries("weatherrobots"),
    4
  );

  // Test Emerging Startups
  results["emerging-startups"] = await testStrategy(
    "Emerging Startups",
    () => generateStartupSearchQueries("weatherrobots"),
    4
  );

  // Final summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("FINAL SUMMARY");
  console.log("=".repeat(60));
  console.log(`\nResults by strategy:`);
  Object.entries(results).forEach(([strategy, items]) => {
    console.log(`  ${strategy}: ${items.length} companies`);
  });

  console.log("\nFinished at:", new Date().toLocaleTimeString());
}

main().catch(console.error);
