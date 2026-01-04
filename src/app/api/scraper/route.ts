import { NextRequest, NextResponse } from "next/server";
import { scraperService, ScrapeResult, ScrapeOptions, ScrapedContact } from "@/services/scraper";
import { createClient } from "@/lib/supabase/server";

export interface ScrapeRequest {
  url?: string;
  urls?: string[];
  options?: ScrapeOptions;
  include_contact_pages?: boolean;
}

// POST - Scrape one or more URLs for contact information
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as ScrapeRequest;

    // Validate at least one URL provided
    const urls = body.urls || (body.url ? [body.url] : []);

    if (urls.length === 0) {
      return NextResponse.json(
        { error: "url or urls is required" },
        { status: 400 }
      );
    }

    // Limit number of URLs per request
    if (urls.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 URLs per request" },
        { status: 400 }
      );
    }

    // Validate URLs
    for (const url of urls) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: `Invalid URL: ${url}` },
          { status: 400 }
        );
      }
    }

    let allContacts: ScrapedContact[] = [];
    let totalPagesScraped = 0;
    const allErrors: string[] = [];

    if (urls.length === 1) {
      // Single URL - can try contact pages
      if (body.include_contact_pages) {
        const result: ScrapeResult = await scraperService.scrapeContactPage(urls[0], body.options);
        allContacts = result.contacts;
        totalPagesScraped = result.pages_scraped;
        allErrors.push(...result.errors);
      } else {
        const contacts = await scraperService.scrapePage(urls[0], body.options);
        allContacts = contacts;
        totalPagesScraped = 1;
      }
    } else {
      // Multiple URLs
      const multiResult = await scraperService.scrapeMultipleSites(urls, body.options);

      // Extract data from map results
      for (const [, result] of multiResult.results) {
        allContacts.push(...result.contacts);
        totalPagesScraped += result.pages_scraped;
        allErrors.push(...result.errors);
      }
    }

    // Count unique emails and phones
    const uniqueEmails = new Set(allContacts.filter(c => c.email).map(c => c.email));
    const uniquePhones = new Set(allContacts.filter(c => c.phone).map(c => c.phone));

    return NextResponse.json({
      success: true,
      contacts: allContacts,
      summary: {
        urls_requested: urls.length,
        pages_scraped: totalPagesScraped,
        total_contacts: allContacts.length,
        unique_emails: uniqueEmails.size,
        unique_phones: uniquePhones.size,
        errors: allErrors.length,
      },
      errors: allErrors.length > 0 ? allErrors : undefined,
    });
  } catch (error) {
    console.error("Scraper error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scrape URLs" },
      { status: 500 }
    );
  }
}
