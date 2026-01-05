import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  searchGoogle,
  generateUpgradeSearchQueries,
  generateSEOSearchQueries,
  generateStartupSearchQueries,
  filterResults,
  type SearchResult,
} from "@/services/web-search";

export type SearchStrategy = "domain-upgrade" | "seo-bidders" | "emerging-startups";

// Request to get queries for a strategy (no actual searching)
export interface GetQueriesRequest {
  action: "get-queries";
  strategy: SearchStrategy;
  domainName: string;
}

// Request to run a single search query
export interface RunQueryRequest {
  action: "run-query";
  query: string;
  maxResults?: number;
}

export type SearchRequest = GetQueriesRequest | RunQueryRequest;

export interface GetQueriesResponse {
  queries: string[];
}

export interface RunQueryResponse {
  results: SearchResult[];
  query: string;
  resultCount: number;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as SearchRequest;

    // Handle get-queries action (fast, no scraping)
    if (body.action === "get-queries") {
      const { strategy, domainName } = body;

      if (!strategy || !domainName) {
        return NextResponse.json(
          { error: "strategy and domainName are required" },
          { status: 400 }
        );
      }

      let queries: string[] = [];

      switch (strategy) {
        case "domain-upgrade":
          queries = generateUpgradeSearchQueries(domainName);
          break;
        case "seo-bidders":
          queries = generateSEOSearchQueries(domainName);
          break;
        case "emerging-startups":
          queries = generateStartupSearchQueries(domainName);
          break;
        default:
          return NextResponse.json(
            { error: "Invalid strategy" },
            { status: 400 }
          );
      }

      // Limit to reasonable number of queries
      const limitedQueries = queries.slice(0, 6);

      return NextResponse.json({
        queries: limitedQueries,
      } as GetQueriesResponse);
    }

    // Handle run-query action (runs single search)
    if (body.action === "run-query") {
      const { query, maxResults = 10 } = body;

      if (!query) {
        return NextResponse.json(
          { error: "query is required" },
          { status: 400 }
        );
      }

      try {
        const results = await searchGoogle(query, {
          maxResults: maxResults + 5, // Get a few extra to account for filtering
          timeout: 30000,
        });

        const filtered = filterResults(results).slice(0, maxResults);

        return NextResponse.json({
          results: filtered,
          query,
          resultCount: filtered.length,
        } as RunQueryResponse);
      } catch (error) {
        console.error(`Search failed for query "${query}":`, error);
        // Return error details for debugging
        return NextResponse.json({
          results: [],
          query,
          resultCount: 0,
          error: error instanceof Error ? error.message : "Search failed",
          errorDetails: error instanceof Error ? error.stack : undefined,
        });
      }
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'get-queries' or 'run-query'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
