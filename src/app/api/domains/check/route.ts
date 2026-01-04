import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import dns from "dns";
import { promisify } from "util";

const resolveDns = promisify(dns.resolve);

export interface DomainCheckRequest {
  domains: string[];
}

export interface DomainCheckResult {
  domain: string;
  isActive: boolean;
  hasWebsite: boolean;
  error?: string;
}

export interface DomainCheckResponse {
  results: DomainCheckResult[];
}

// Check if a domain has DNS records (any type)
async function checkDNS(domain: string): Promise<boolean> {
  try {
    // Try A records first
    await resolveDns(domain, "A");
    return true;
  } catch {
    try {
      // Try AAAA records
      await resolveDns(domain, "AAAA");
      return true;
    } catch {
      try {
        // Try CNAME records
        await resolveDns(domain, "CNAME");
        return true;
      } catch {
        return false;
      }
    }
  }
}

// Check if a domain has an active website via HTTP
async function checkWebsite(domain: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    // Try HTTPS first
    const response = await fetch(`https://${domain}`, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    return response.ok || response.status === 403 || response.status === 401;
  } catch {
    clearTimeout(timeout);

    // Try HTTP as fallback
    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), 5000);

    try {
      const response = await fetch(`http://${domain}`, {
        method: "HEAD",
        signal: controller2.signal,
        redirect: "follow",
      });
      clearTimeout(timeout2);
      return response.ok || response.status === 403 || response.status === 401;
    } catch {
      clearTimeout(timeout2);
      return false;
    }
  }
}

// Check a single domain
async function checkDomain(domain: string): Promise<DomainCheckResult> {
  try {
    // First check DNS
    const hasDNS = await checkDNS(domain);

    if (!hasDNS) {
      return {
        domain,
        isActive: false,
        hasWebsite: false,
      };
    }

    // If DNS exists, check for website
    const hasWebsite = await checkWebsite(domain);

    return {
      domain,
      isActive: hasDNS,
      hasWebsite,
    };
  } catch (error) {
    return {
      domain,
      isActive: false,
      hasWebsite: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

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

    const body = await request.json() as DomainCheckRequest;
    const { domains } = body;

    if (!domains || !Array.isArray(domains)) {
      return NextResponse.json(
        { error: "domains array is required" },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    const maxBatchSize = 50;
    const domainsToCheck = domains.slice(0, maxBatchSize);

    // Check domains in parallel with concurrency limit
    const concurrencyLimit = 10;
    const results: DomainCheckResult[] = [];

    for (let i = 0; i < domainsToCheck.length; i += concurrencyLimit) {
      const batch = domainsToCheck.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(batch.map(checkDomain));
      results.push(...batchResults);
    }

    return NextResponse.json({ results } as DomainCheckResponse);
  } catch (error) {
    console.error("Domain check error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Domain check failed" },
      { status: 500 }
    );
  }
}
