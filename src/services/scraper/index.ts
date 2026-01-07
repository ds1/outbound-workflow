import * as cheerio from "cheerio";

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
  respect_robots?: boolean;
}

export interface ScrapeResult {
  contacts: ScrapedContact[];
  pages_scraped: number;
  errors: string[];
}

// Common email patterns to extract (with word boundary to prevent matching trailing text)
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;

// US phone patterns
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;

// File extensions that should NOT be part of valid emails
const BLOCKED_FILE_EXTENSIONS = [
  ".webp", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".ico", ".bmp", ".tiff",
  ".mp4", ".webm", ".avi", ".mov", ".wmv", ".mp3", ".wav", ".ogg",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".zip", ".rar", ".7z", ".tar", ".gz",
  ".js", ".css", ".html", ".htm", ".xml", ".json",
  ".woff", ".woff2", ".ttf", ".eot",
];

// Email prefixes that are typically not useful for sales outreach
const BLOCKED_EMAIL_PREFIXES = [
  "noreply", "no-reply", "no_reply", "donotreply", "do-not-reply", "do_not_reply",
  "mailer-daemon", "postmaster", "webmaster", "hostmaster", "admin@localhost",
  "root", "abuse", "spam", "unsubscribe", "bounce", "null",
];

// Domains that indicate test/placeholder emails
const BLOCKED_EMAIL_DOMAINS = [
  "example.com", "example.org", "example.net",
  "test.com", "test.org", "localhost", "localhost.localdomain",
  "domain.com", "email.com", "yourcompany.com", "yourdomain.com",
  "company.com", "acme.com", "foo.com", "bar.com",
  "mailinator.com", "tempmail.com", "throwaway.com",
  "sentry.io", "wixpress.com",
];

// Default scrape options
const DEFAULT_OPTIONS: ScrapeOptions = {
  max_pages: 5,
  delay_ms: 500,
  timeout_ms: 15000,
  respect_robots: true,
};

class ScraperService {
  /**
   * Fetch a page with proper headers
   */
  private async fetchPage(url: string, timeout: number): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: controller.signal,
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Check robots.txt for a URL
   */
  async canScrape(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

      const response = await fetch(robotsUrl, {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) return true;

      const text = await response.text();
      const path = urlObj.pathname;

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
      return true;
    }
  }

  /**
   * Extract text from HTML with proper spacing between elements
   * Cheerio's .text() doesn't add spaces between adjacent elements,
   * which causes emails to be concatenated with surrounding text
   */
  private extractTextWithSpacing($: cheerio.CheerioAPI): string {
    // Add spaces after block-level elements before extracting text
    $("p, div, br, li, td, th, h1, h2, h3, h4, h5, h6, span, a").each((_, el) => {
      const $el = $(el);
      $el.append(" ");
    });

    // Get text and normalize whitespace
    return $("body").text().replace(/\s+/g, " ").trim();
  }

  /**
   * Extract emails from text with improved filtering
   */
  extractEmails(text: string): string[] {
    const decodedText = text
      // Decode unicode escapes
      .replace(/\\u003e/gi, ">")
      .replace(/\\u003c/gi, "<")
      .replace(/u003e/gi, ">")
      .replace(/u003c/gi, "<")
      // Decode URL encoding
      .replace(/%40/g, "@")
      .replace(/%2E/gi, ".")
      // Normalize obfuscated @ symbols
      .replace(/\s*\[at\]\s*/gi, "@")
      .replace(/\s*\(at\)\s*/gi, "@")
      .replace(/\s*\{at\}\s*/gi, "@")
      .replace(/\s+at\s+/gi, "@")
      // Normalize obfuscated dots
      .replace(/\s*\[dot\]\s*/gi, ".")
      .replace(/\s*\(dot\)\s*/gi, ".")
      .replace(/\s*\{dot\}\s*/gi, ".")
      .replace(/\s+dot\s+/gi, ".");

    const matches = decodedText.match(EMAIL_REGEX) || [];

    return [...new Set(matches)].filter((email) => {
      const lower = email.toLowerCase();
      const [localPart, domain] = lower.split("@");

      if (!localPart || !domain) return false;

      for (const ext of BLOCKED_FILE_EXTENSIONS) {
        if (lower.includes(ext)) return false;
      }

      for (const prefix of BLOCKED_EMAIL_PREFIXES) {
        if (localPart === prefix || localPart.startsWith(prefix + ".")) return false;
      }

      for (const blockedDomain of BLOCKED_EMAIL_DOMAINS) {
        if (domain === blockedDomain || domain.endsWith("." + blockedDomain)) return false;
      }

      const domainParts = domain.split(".");
      if (domainParts.length < 2) return false;

      const tld = domainParts[domainParts.length - 1];
      if (tld.length < 2 || tld.length > 10) return false;
      if (/^\d+x?$/.test(tld)) return false;
      if (/^\d+$/.test(localPart)) return false;
      if (localPart.includes("-150x150")) return false;
      if (localPart.startsWith("group-") && /\d/.test(localPart)) return false;

      return true;
    });
  }

  /**
   * Extract phone numbers from text
   */
  extractPhones(text: string): string[] {
    const matches = text.match(PHONE_REGEX) || [];
    return [...new Set(matches)]
      .map((phone) => phone.replace(/\D/g, ""))
      .filter((phone) => {
        return phone.length === 10 || (phone.length === 11 && phone.startsWith("1"));
      });
  }

  /**
   * Extract company name from HTML
   */
  extractCompanyName($: cheerio.CheerioAPI): string | undefined {
    // Try JSON-LD
    const jsonLd = $('script[type="application/ld+json"]').first().html();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.name) return data.name;
        if (data.organization?.name) return data.organization.name;
      } catch {
        // Ignore
      }
    }

    // Try meta tags
    const ogSiteName = $('meta[property="og:site_name"]').attr("content");
    if (ogSiteName) return ogSiteName;

    const ogTitle = $('meta[property="og:title"]').attr("content");
    if (ogTitle) return ogTitle;

    // Try title tag
    const title = $("title").text().split("|")[0].split("-")[0].trim();
    if (title && title.length < 50) return title;

    return undefined;
  }

  /**
   * Scrape a single page for contact information
   */
  async scrapePage(url: string, options: ScrapeOptions = {}): Promise<ScrapedContact[]> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const contacts: ScrapedContact[] = [];

    try {
      const html = await this.fetchPage(url, opts.timeout_ms || 15000);
      const $ = cheerio.load(html);

      // Extract company name first (before modifying DOM)
      const company = this.extractCompanyName($);

      // Get text content with proper spacing between elements
      const text = this.extractTextWithSpacing($);

      // Extract emails from both raw HTML (for mailto: links) and spaced text
      const emails = this.extractEmails(html + " " + text);

      // Extract phones
      const phones = this.extractPhones(text);

      const now = new Date().toISOString();

      for (const email of emails) {
        contacts.push({
          email,
          company,
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
            company,
            source_url: url,
            scraped_at: now,
          });
        }
      }
    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
    }

    return contacts;
  }

  /**
   * Find contact page URLs from a homepage
   */
  findContactPageUrls($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const links: string[] = [];
    const baseUrlObj = new URL(baseUrl);

    $("a").each((_, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().toLowerCase();

      if (!href) return;

      const isContactRelated =
        href.toLowerCase().includes("contact") ||
        href.toLowerCase().includes("about") ||
        href.toLowerCase().includes("team") ||
        text.includes("contact") ||
        text.includes("about us") ||
        text.includes("our team") ||
        text.includes("get in touch");

      if (isContactRelated) {
        try {
          const fullUrl = new URL(href, baseUrl);
          // Only include links from same domain
          if (fullUrl.hostname === baseUrlObj.hostname) {
            links.push(fullUrl.href);
          }
        } catch {
          // Invalid URL
        }
      }
    });

    return [...new Set(links)].slice(0, 5);
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

    try {
      // Scrape base URL
      const html = await this.fetchPage(baseUrl, opts.timeout_ms || 15000);
      const $ = cheerio.load(html);
      pagesScraped++;

      // Extract company name first (before modifying DOM)
      const company = this.extractCompanyName($);

      // Find contact page URLs (before modifying DOM)
      const contactLinks = this.findContactPageUrls($, baseUrl);

      // Extract contacts from homepage with proper text spacing
      const text = this.extractTextWithSpacing($);
      const emails = this.extractEmails(html + " " + text);
      const phones = this.extractPhones(text);
      const now = new Date().toISOString();

      for (const email of emails) {
        contacts.push({ email, company, source_url: baseUrl, scraped_at: now });
      }

      for (const phone of phones) {
        const existing = contacts.find((c) => !c.phone);
        if (existing) {
          existing.phone = phone;
        } else {
          contacts.push({ phone, company, source_url: baseUrl, scraped_at: now });
        }
      }

      // Scrape contact pages

      for (const link of contactLinks) {
        if (pagesScraped >= (opts.max_pages || 5)) break;

        await new Promise((resolve) => setTimeout(resolve, opts.delay_ms || 500));

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
    }

    return {
      contacts: this.deduplicateContacts(contacts),
      pages_scraped: pagesScraped,
      errors,
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
   * Validate contact
   */
  validateContact(contact: ScrapedContact): boolean {
    if (!contact.email && !contact.phone) {
      return false;
    }

    if (contact.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact.email)) {
        return false;
      }
    }

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
