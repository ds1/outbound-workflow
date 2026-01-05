// Direct Lead Scraper for WeatherRobots.com domain
// Bypasses API to use scraper service directly
// Run with: npx tsx scripts/scrape-weatherrobots-direct.ts

import { config } from "dotenv";
import { resolve } from "path";
import * as fs from "fs/promises";

config({ path: resolve(process.cwd(), ".env.local") });

// Target companies that would be interested in WeatherRobots.com
const TARGET_COMPANIES = [
  // Weather Drone Companies
  { name: "Meteomatics", url: "https://www.meteomatics.com", category: "Weather Drones" },
  { name: "ZenaDrone", url: "https://www.zenadrone.com", category: "Weather Drones" },
  { name: "Black Swift Technologies", url: "https://www.blackswifttech.com", category: "Weather Drones" },

  // Weather Analytics/Intelligence
  { name: "WeatherXM", url: "https://weatherxm.com", category: "Weather Analytics" },
  { name: "Climavision", url: "https://climavision.com", category: "Weather Analytics" },
  { name: "Tomorrow.io", url: "https://www.tomorrow.io", category: "Weather Analytics" },

  // Agricultural Weather & Robotics
  { name: "SwarmFarm Robotics", url: "https://www.swarmfarm.com", category: "AgTech Robotics" },
  { name: "Davis Instruments", url: "https://www.davisinstruments.com", category: "Weather Sensors" },

  // Ocean Weather Robots
  { name: "Saildrone", url: "https://www.saildrone.com", category: "Ocean Weather Robots" },
  { name: "Sofar Ocean", url: "https://www.sofarocean.com", category: "Ocean Weather Robots" },
];

interface ScrapedContact {
  email?: string;
  phone?: string;
  name?: string;
  company?: string;
  source_url: string;
  scraped_at: string;
  category?: string;
}

async function main() {
  console.log("🤖 WeatherRobots.com Lead Scraper (Direct Mode)");
  console.log("═".repeat(50));
  console.log(`\nTarget: ${TARGET_COMPANIES.length} companies\n`);

  // Dynamically import the scraper service
  const { scraperService } = await import("../src/services/scraper/index.js");

  const allContacts: ScrapedContact[] = [];
  const errors: string[] = [];

  try {
    for (const company of TARGET_COMPANIES) {
      console.log(`\n📡 Scraping ${company.name}...`);
      console.log(`   URL: ${company.url}`);

      try {
        const result = await scraperService.scrapeContactPage(company.url, {
          max_pages: 5,
          delay_ms: 2000,
          timeout_ms: 30000,
          respect_robots: true,
        });

        console.log(`   Pages scraped: ${result.pages_scraped}`);
        console.log(`   Contacts found: ${result.contacts.length}`);

        if (result.errors.length > 0) {
          console.log(`   Warnings: ${result.errors.length}`);
        }

        // Add company info to contacts
        for (const contact of result.contacts) {
          allContacts.push({
            ...contact,
            company: company.name,
            category: company.category,
          });
        }

        if (result.contacts.length > 0) {
          console.log(`   ✅ Found emails: ${result.contacts.filter((c) => c.email).map((c) => c.email).join(", ") || "none"}`);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.log(`   ❌ Error: ${errorMsg}`);
        errors.push(`${company.name}: ${errorMsg}`);
      }

      // Respectful delay between sites
      console.log("   Waiting 5s before next site...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  } finally {
    // Always close browser
    console.log("\n🔄 Closing browser...");
    await scraperService.closeBrowser();
  }

  // Deduplicate by email
  const uniqueEmails = new Map<string, ScrapedContact>();
  for (const contact of allContacts) {
    if (contact.email && !uniqueEmails.has(contact.email)) {
      uniqueEmails.set(contact.email, contact);
    }
  }

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log("📊 SCRAPING COMPLETE");
  console.log("═".repeat(50));
  console.log(`\nTotal contacts: ${allContacts.length}`);
  console.log(`Unique emails: ${uniqueEmails.size}`);
  console.log(`Errors: ${errors.length}`);

  if (uniqueEmails.size > 0) {
    console.log("\n📧 UNIQUE CONTACTS:");
    console.log("-".repeat(50));

    for (const [email, contact] of uniqueEmails) {
      console.log(`\n${contact.company} (${contact.category})`);
      console.log(`  Email: ${email}`);
      if (contact.phone) console.log(`  Phone: ${contact.phone}`);
      console.log(`  Source: ${contact.source_url}`);
    }
  }

  // Prepare for database import
  const leadsForImport = Array.from(uniqueEmails.values()).map((c) => ({
    email: c.email,
    phone: c.phone || null,
    first_name: null,
    last_name: null,
    company_name: c.company,
    source: "scraped",
    notes: `Category: ${c.category}. Scraped from ${c.source_url}`,
  }));

  // Save results
  const outputPath = resolve(process.cwd(), "scripts/weatherrobots-leads.json");
  await fs.writeFile(outputPath, JSON.stringify(leadsForImport, null, 2));
  console.log(`\n✅ Results saved to: ${outputPath}`);

  if (errors.length > 0) {
    console.log("\n⚠️ ERRORS ENCOUNTERED:");
    for (const err of errors) {
      console.log(`  - ${err}`);
    }
  }

  console.log("\n📝 Next steps:");
  console.log("1. Review the leads in scripts/weatherrobots-leads.json");
  console.log("2. Import leads via the Leads page in your app");
  console.log("3. Associate them with your WeatherRobots.com domain");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
