import puppeteer, { Browser, Page } from "puppeteer";

// Types for scraped data
export interface ScrapedContact {
  email?: string;
  phone?: string;
  name?: string;
  title?: string;
  company?: string;
  source_url: string;
  scraped_at: string;
}

export interface ScrapeOptions {
  max_pages?: number;
  delay_ms?: number;
  timeout_ms?: number;
  headless?: boolean;
  respect_robots?: boolean;
}

export interface ScrapeResult {
  contacts: ScrapedContact[];
  pages_scraped: number;
  errors: string[];
}

// Common email patterns to extract
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// US phone patterns
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;

// File extensions that should NOT be part of valid emails
const BLOCKED_FILE_EXTENSIONS = [
  '.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.bmp', '.tiff',
  '.mp4', '.webm', '.avi', '.mov', '.wmv', '.mp3', '.wav', '.ogg',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.rar', '.7z', '.tar', '.gz',
  '.js', '.css', '.html', '.htm', '.xml', '.json',
  '.woff', '.woff2', '.ttf', '.eot',
];

// Email prefixes that are typically not useful for sales outreach
const BLOCKED_EMAIL_PREFIXES = [
  'noreply', 'no-reply', 'no_reply', 'donotreply', 'do-not-reply', 'do_not_reply',
  'mailer-daemon', 'postmaster', 'webmaster', 'hostmaster', 'admin@localhost',
  'root', 'abuse', 'spam', 'unsubscribe', 'bounce', 'null',
];

// Domains that indicate test/placeholder emails
const BLOCKED_EMAIL_DOMAINS = [
  'example.com', 'example.org', 'example.net',
  'test.com', 'test.org', 'localhost', 'localhost.localdomain',
  'domain.com', 'email.com', 'yourcompany.com', 'yourdomain.com',
  'company.com', 'acme.com', 'foo.com', 'bar.com',
  'mailinator.com', 'tempmail.com', 'throwaway.com',
];

// Default scrape options
const DEFAULT_OPTIONS: ScrapeOptions = {
  max_pages: 10,
  delay_ms: 2000,
  timeout_ms: 30000,
  headless: true,
  respect_robots: true,
};

class ScraperService {
  private browser: Browser | null = null;

  /**
   * Initialize browser
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
        ],
      });
    }
    return this.browser;
  }

  /**
   * Close browser
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Check robots.txt for a URL
   */
  async canScrape(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

      const response = await fetch(robotsUrl);
      if (!response.ok) return true; // No robots.txt = allowed

      const text = await response.text();
      const path = urlObj.pathname;

      // Simple robots.txt parsing
      const lines = text.split("\n");
      let userAgentApplies = false;

      for (const line of lines) {
        const trimmed = line.trim().toLowerCase();

        if (trimmed.startsWith("user-agent:")) {
          const agent = trimmed.replace("user-agent:", "").trim();
          userAgentApplies = agent === "*" || agent.includes("bot");
        }

        if (userAgentApplies && trimmed.startsWith("disallow:")) {
          const disallowed = trimmed.replace("disallow:", "").trim();
          if (disallowed && path.startsWith(disallowed)) {
            return false;
          }
        }
      }

      return true;
    } catch {
      return true; // Error fetching robots.txt = proceed
    }
  }

  /**
   * Extract emails from text with improved filtering
   */
  extractEmails(text: string): string[] {
    // Decode common URL-encoded characters before extraction
    const decodedText = text
      .replace(/\\u003e/gi, '>') // Unicode escapes
      .replace(/\\u003c/gi, '<')
      .replace(/u003e/gi, '>')   // Without backslash
      .replace(/u003c/gi, '<')
      .replace(/%40/g, '@')      // URL-encoded @
      .replace(/%2E/gi, '.');    // URL-encoded .

    const matches = decodedText.match(EMAIL_REGEX) || [];

    // Filter out false positives with comprehensive checks
    return [...new Set(matches)].filter((email) => {
      const lower = email.toLowerCase();
      const [localPart, domain] = lower.split('@');

      if (!localPart || !domain) return false;

      // Check if email contains file extensions (like image@2x.webp)
      for (const ext of BLOCKED_FILE_EXTENSIONS) {
        if (lower.includes(ext)) return false;
      }

      // Check blocked email prefixes
      for (const prefix of BLOCKED_EMAIL_PREFIXES) {
        if (localPart === prefix || localPart.startsWith(prefix + '.')) return false;
      }

      // Check blocked domains
      for (const blockedDomain of BLOCKED_EMAIL_DOMAINS) {
        if (domain === blockedDomain) return false;
      }

      // Additional validation: domain must have at least one dot and valid TLD
      const domainParts = domain.split('.');
      if (domainParts.length < 2) return false;

      const tld = domainParts[domainParts.length - 1];
      // TLD must be 2-10 characters (covers .com to .photography)
      if (tld.length < 2 || tld.length > 10) return false;

      // Reject if TLD looks like a file extension number (e.g., 2x, 3x for image@2x)
      if (/^\d+x?$/.test(tld)) return false;

      // Reject emails that look like encoded HTML entities or image references
      if (/^\d+$/.test(localPart)) return false; // Pure numbers
      if (localPart.includes('-150x150')) return false; // WordPress thumbnail pattern
      if (localPart.startsWith('group-') && /\d/.test(localPart)) return false; // Group-123 patterns

      return true;
    });
  }

  /**
   * Extract phone numbers from text
   */
  extractPhones(text: string): string[] {
    const matches = text.match(PHONE_REGEX) || [];
    return [...new Set(matches)].map((phone) => {
      // Normalize phone number
      return phone.replace(/\D/g, "");
    }).filter((phone) => {
      // Valid US phones have 10 or 11 digits
      return phone.length === 10 || (phone.length === 11 && phone.startsWith("1"));
    });
  }

  /**
   * Scrape a single page for contact information
   */
  async scrapePage(url: string, options: ScrapeOptions = {}): Promise<ScrapedContact[]> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const contacts: ScrapedContact[] = [];

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set user agent
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to page
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: opts.timeout_ms,
      });

      // Get page content
      const content = await page.content();
      const text = await page.evaluate(() => document.body.innerText);

      // Extract emails
      const emails = this.extractEmails(content + " " + text);

      // Extract phones
      const phones = this.extractPhones(text);

      // Create contacts from extracted data
      const now = new Date().toISOString();

      for (const email of emails) {
        contacts.push({
          email,
          source_url: url,
          scraped_at: now,
        });
      }

      // Add phones to existing contacts or create new ones
      for (const phone of phones) {
        const existingContact = contacts.find((c) => !c.phone);
        if (existingContact) {
          existingContact.phone = phone;
        } else {
          contacts.push({
            phone,
            source_url: url,
            scraped_at: now,
          });
        }
      }

      // Try to extract additional info from structured data
      const structuredData = await this.extractStructuredData(page);
      if (structuredData) {
        for (const contact of contacts) {
          if (!contact.company && structuredData.company) {
            contact.company = structuredData.company;
          }
        }
      }
    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
    } finally {
      await page.close();
    }

    return contacts;
  }

  /**
   * Extract structured data (JSON-LD, microdata)
   */
  private async extractStructuredData(page: Page): Promise<{ company?: string; name?: string } | null> {
    try {
      const data = await page.evaluate(() => {
        // Try JSON-LD
        const jsonLd = document.querySelector('script[type="application/ld+json"]');
        if (jsonLd) {
          try {
            const parsed = JSON.parse(jsonLd.textContent || "{}");
            return {
              company: parsed.name || parsed.organization?.name,
              name: parsed.founder?.name,
            };
          } catch {
            // Ignore parse errors
          }
        }

        // Try meta tags
        const ogSiteName = document.querySelector('meta[property="og:site_name"]');
        if (ogSiteName) {
          return { company: ogSiteName.getAttribute("content") || undefined };
        }

        return null;
      });

      return data;
    } catch {
      return null;
    }
  }

  /**
   * Scrape a website's contact page
   */
  async scrapeContactPage(baseUrl: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const contacts: ScrapedContact[] = [];
    const errors: string[] = [];
    let pagesScraped = 0;

    // Check robots.txt
    if (opts.respect_robots) {
      const canScrape = await this.canScrape(baseUrl);
      if (!canScrape) {
        return {
          contacts: [],
          pages_scraped: 0,
          errors: ["Blocked by robots.txt"],
        };
      }
    }

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Navigate to base URL
      await page.goto(baseUrl, {
        waitUntil: "networkidle2",
        timeout: opts.timeout_ms,
      });
      pagesScraped++;

      // Scrape current page
      const baseContacts = await this.scrapePage(baseUrl, opts);
      contacts.push(...baseContacts);

      // Find contact page links
      const contactLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("a"));
        return links
          .filter((a) => {
            const href = a.href.toLowerCase();
            const text = a.textContent?.toLowerCase() || "";
            return (
              href.includes("contact") ||
              href.includes("about") ||
              href.includes("team") ||
              text.includes("contact") ||
              text.includes("about us") ||
              text.includes("our team")
            );
          })
          .map((a) => a.href)
          .slice(0, 5); // Limit to 5 contact-related pages
      });

      // Scrape each contact page
      for (const link of contactLinks) {
        if (pagesScraped >= (opts.max_pages || 10)) break;

        // Delay between requests
        await new Promise((resolve) => setTimeout(resolve, opts.delay_ms));

        try {
          const pageContacts = await this.scrapePage(link, opts);
          contacts.push(...pageContacts);
          pagesScraped++;
        } catch (err) {
          errors.push(`Failed to scrape ${link}: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      }
    } catch (err) {
      errors.push(`Failed to scrape ${baseUrl}: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      await page.close();
    }

    // Deduplicate contacts
    const uniqueContacts = this.deduplicateContacts(contacts);

    return {
      contacts: uniqueContacts,
      pages_scraped: pagesScraped,
      errors,
    };
  }

  /**
   * Scrape multiple websites
   */
  async scrapeMultipleSites(
    urls: string[],
    options: ScrapeOptions = {}
  ): Promise<{
    results: Map<string, ScrapeResult>;
    total_contacts: number;
    total_errors: number;
  }> {
    const results = new Map<string, ScrapeResult>();
    let totalContacts = 0;
    let totalErrors = 0;

    for (const url of urls) {
      const result = await this.scrapeContactPage(url, options);
      results.set(url, result);
      totalContacts += result.contacts.length;
      totalErrors += result.errors.length;

      // Delay between sites
      await new Promise((resolve) => setTimeout(resolve, options.delay_ms || 2000));
    }

    return {
      results,
      total_contacts: totalContacts,
      total_errors: totalErrors,
    };
  }

  /**
   * Deduplicate contacts by email/phone
   */
  private deduplicateContacts(contacts: ScrapedContact[]): ScrapedContact[] {
    const seen = new Set<string>();
    return contacts.filter((contact) => {
      const key = contact.email || contact.phone || "";
      if (key && seen.has(key)) {
        return false;
      }
      if (key) {
        seen.add(key);
      }
      return true;
    });
  }

  /**
   * Search Google for company websites
   * Note: This is a simplified version. For production, use Google Custom Search API
   */
  async searchCompanyWebsites(
    industry: string,
    location?: string,
    limit: number = 10
  ): Promise<string[]> {
    // This is a placeholder - in production, use Google Custom Search API
    // or a similar service that allows programmatic search
    console.warn("searchCompanyWebsites requires Google Custom Search API configuration");
    return [];
  }

  /**
   * Validate and clean scraped contact
   */
  validateContact(contact: ScrapedContact): boolean {
    // Must have either email or phone
    if (!contact.email && !contact.phone) {
      return false;
    }

    // Validate email format
    if (contact.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact.email)) {
        return false;
      }
    }

    // Validate phone format (US)
    if (contact.phone) {
      const digits = contact.phone.replace(/\D/g, "");
      if (digits.length !== 10 && !(digits.length === 11 && digits.startsWith("1"))) {
        return false;
      }
    }

    return true;
  }
}

// Export singleton instance
export const scraperService = new ScraperService();

// Export class for testing
export { ScraperService };
