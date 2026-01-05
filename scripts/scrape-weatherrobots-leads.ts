// Lead Scraper for WeatherRobots.com domain
// Run with: npx tsx scripts/scrape-weatherrobots-leads.ts

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

// Target companies that would be interested in WeatherRobots.com
const TARGET_COMPANIES = [
  // Weather Drone Companies
  { name: "Meteomatics", url: "https://www.meteomatics.com", category: "Weather Drones" },
  { name: "ZenaDrone", url: "https://www.zenadrone.com", category: "Weather Drones" },
  { name: "Black Swift Technologies", url: "https://www.blackswifttech.com", category: "Weather Drones" },
  { name: "GreenSight", url: "https://www.greensight.ag", category: "Weather Drones" },

  // Weather Analytics/Intelligence
  { name: "WeatherXM", url: "https://weatherxm.com", category: "Weather Analytics" },
  { name: "Climavision", url: "https://climavision.com", category: "Weather Analytics" },
  { name: "Tomorrow.io", url: "https://www.tomorrow.io", category: "Weather Analytics" },
  { name: "DTN", url: "https://www.dtn.com", category: "Weather Analytics" },

  // Agricultural Weather & Robotics
  { name: "SwarmFarm Robotics", url: "https://www.swarmfarm.com", category: "AgTech Robotics" },
  { name: "Naio Technologies", url: "https://www.naio-technologies.com", category: "AgTech Robotics" },
  { name: "Davis Instruments", url: "https://www.davisinstruments.com", category: "Weather Sensors" },
  { name: "Pessl Instruments", url: "https://metos.at", category: "Weather Sensors" },

  // Robotics Companies
  { name: "Saildrone", url: "https://www.saildrone.com", category: "Ocean Weather Robots" },
  { name: "Sofar Ocean", url: "https://www.sofarocean.com", category: "Ocean Weather Robots" },
];

interface ScrapedContact {
  email?: string;
  phone?: string;
  name?: string;
  title?: string;
  company?: string;
  source_url: string;
  scraped_at: string;
}

interface ScrapeResponse {
  success: boolean;
  contacts: ScrapedContact[];
  summary: {
    urls_requested: number;
    pages_scraped: number;
    total_contacts: number;
    unique_emails: number;
    unique_phones: number;
    errors: number;
  };
  errors?: string[];
}

async function scrapeCompany(company: { name: string; url: string; category: string }): Promise<{
  company: string;
  category: string;
  contacts: ScrapedContact[];
  error?: string;
}> {
  console.log(`\n📡 Scraping ${company.name} (${company.url})...`);

  try {
    const response = await fetch("http://localhost:3000/api/scraper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: company.url,
        include_contact_pages: true,
        options: {
          max_pages: 5,
          delay_ms: 2000,
          timeout_ms: 30000,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        company: company.name,
        category: company.category,
        contacts: [],
        error: `HTTP ${response.status}: ${text}`,
      };
    }

    const data: ScrapeResponse = await response.json();

    // Add company name to contacts
    const contactsWithCompany = data.contacts.map((c) => ({
      ...c,
      company: company.name,
    }));

    console.log(`   ✅ Found ${data.summary.unique_emails} emails, ${data.summary.unique_phones} phones`);

    return {
      company: company.name,
      category: company.category,
      contacts: contactsWithCompany,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.log(`   ❌ Error: ${errorMsg}`);
    return {
      company: company.name,
      category: company.category,
      contacts: [],
      error: errorMsg,
    };
  }
}

async function main() {
  console.log("🤖 WeatherRobots.com Lead Scraper");
  console.log("═".repeat(50));
  console.log(`\nTarget: ${TARGET_COMPANIES.length} companies in weather/robotics space\n`);

  const allContacts: (ScrapedContact & { category: string })[] = [];
  const errors: string[] = [];

  // Check if local server is running
  try {
    await fetch("http://localhost:3000/api/scraper", { method: "OPTIONS" });
  } catch {
    console.error("❌ Error: Local server not running. Start with 'npm run dev'");
    process.exit(1);
  }

  // Scrape each company (with delay between requests)
  for (const company of TARGET_COMPANIES) {
    const result = await scrapeCompany(company);

    if (result.error) {
      errors.push(`${result.company}: ${result.error}`);
    }

    for (const contact of result.contacts) {
      allContacts.push({ ...contact, category: result.category });
    }

    // Delay between companies to be respectful
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  // Deduplicate by email
  const uniqueEmails = new Map<string, (typeof allContacts)[0]>();
  for (const contact of allContacts) {
    if (contact.email && !uniqueEmails.has(contact.email)) {
      uniqueEmails.set(contact.email, contact);
    }
  }

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log("📊 SCRAPING COMPLETE");
  console.log("═".repeat(50));
  console.log(`\nTotal unique emails: ${uniqueEmails.size}`);
  console.log(`Total errors: ${errors.length}`);

  // Output results
  if (uniqueEmails.size > 0) {
    console.log("\n📧 CONTACTS FOUND:");
    console.log("-".repeat(50));

    for (const [email, contact] of uniqueEmails) {
      console.log(`\n${contact.company} (${contact.category})`);
      console.log(`  Email: ${email}`);
      if (contact.phone) console.log(`  Phone: ${contact.phone}`);
      if (contact.name) console.log(`  Name: ${contact.name}`);
      console.log(`  Source: ${contact.source_url}`);
    }
  }

  // Output as JSON for import
  const leadsForImport = Array.from(uniqueEmails.values()).map((c) => ({
    email: c.email,
    phone: c.phone || null,
    first_name: c.name?.split(" ")[0] || null,
    last_name: c.name?.split(" ").slice(1).join(" ") || null,
    company_name: c.company,
    source: "scraped" as const,
    notes: `Category: ${c.category}. Scraped from ${c.source_url}`,
  }));

  console.log("\n\n📁 JSON FOR IMPORT:");
  console.log("-".repeat(50));
  console.log(JSON.stringify(leadsForImport, null, 2));

  // Save to file
  const fs = await import("fs/promises");
  const outputPath = resolve(process.cwd(), "scripts/weatherrobots-leads.json");
  await fs.writeFile(outputPath, JSON.stringify(leadsForImport, null, 2));
  console.log(`\n✅ Saved to ${outputPath}`);

  if (errors.length > 0) {
    console.log("\n⚠️ ERRORS:");
    for (const err of errors) {
      console.log(`  - ${err}`);
    }
  }
}

main().catch(console.error);
