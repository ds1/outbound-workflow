"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useDomains } from "@/hooks/useDomains";
import { useBulkCreateLeads } from "@/hooks/useLeads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Search,
  Plus,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  ArrowUpCircle,
  Building2,
  Rocket,
  ArrowLeft,
  Globe,
  Circle,
} from "lucide-react";
import type { Domain } from "@/types/database";
import { extractKeywords } from "@/lib/lead-targets";
import {
  LEAD_STRATEGIES,
  type LeadStrategy,
  type StrategyTarget,
  generateMarketLeaderTargets,
} from "@/lib/lead-strategies";
import type { SearchResult } from "@/services/web-search";
import type {
  GetQueriesResponse,
  RunQueryResponse,
} from "@/app/api/search/route";

interface ScrapedContact {
  email?: string;
  phone?: string;
  name?: string;
  company?: string;
  source_url: string;
}

interface ScrapeProgress {
  company: string;
  status: "pending" | "scraping" | "done" | "error";
  contactsFound: number;
  error?: string;
}

interface SearchQueryProgress {
  query: string;
  status: "pending" | "searching" | "done" | "error";
  resultCount: number;
}

interface FindLeadsDialogProps {
  domain?: Domain | null;
  open: boolean;
  onClose: () => void;
  showDomainSelector?: boolean;
}

type Phase = "strategy" | "setup" | "searching" | "scraping" | "results";

const STRATEGY_ICONS = {
  "domain-upgrade": ArrowUpCircle,
  "seo-bidders": Search,
  "emerging-startups": Rocket,
  "market-leaders": Building2,
};

export function FindLeadsDialog({
  domain: initialDomain,
  open,
  onClose,
  showDomainSelector = false,
}: FindLeadsDialogProps) {
  // State
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(initialDomain || null);
  const [selectedStrategy, setSelectedStrategy] = useState<LeadStrategy | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [targets, setTargets] = useState<StrategyTarget[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [customUrl, setCustomUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("strategy");
  const [progress, setProgress] = useState<ScrapeProgress[]>([]);
  const [contacts, setContacts] = useState<ScrapedContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  // Search progress state
  const [searchQueries, setSearchQueries] = useState<SearchQueryProgress[]>([]);
  const [totalDomainsFound, setTotalDomainsFound] = useState(0);
  const [uniqueDomains, setUniqueDomains] = useState<Set<string>>(new Set());

  // Hooks
  const { data: domains = [] } = useDomains();
  const bulkCreateLeads = useBulkCreateLeads();

  // Update keywords when domain changes
  useEffect(() => {
    if (selectedDomain) {
      const domainName = selectedDomain.name || selectedDomain.full_domain;
      const extractedKeywords = extractKeywords(domainName);
      setKeywords(extractedKeywords);
    } else {
      setKeywords([]);
    }
  }, [selectedDomain]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setPhase("strategy");
      setSelectedStrategy(null);
      setProgress([]);
      setContacts([]);
      setSelectedContacts(new Set());
      setCustomUrl("");
      setTargets([]);
      setSelectedTargets(new Set());
      setSearchQueries([]);
      setTotalDomainsFound(0);
      setUniqueDomains(new Set());
      if (!showDomainSelector) {
        setSelectedDomain(initialDomain || null);
      }
    } else if (initialDomain) {
      setSelectedDomain(initialDomain);
    }
  }, [open, initialDomain, showDomainSelector]);

  // Generate targets when strategy is selected
  const handleStrategySelect = async (strategy: LeadStrategy) => {
    if (!selectedDomain) return;

    setSelectedStrategy(strategy);

    if (strategy === "market-leaders") {
      // Market Leaders uses static mapping - no web search needed
      const marketTargets = generateMarketLeaderTargets(selectedDomain);
      setTargets(marketTargets);
      setSelectedTargets(new Set(marketTargets.map((t) => t.url)));
      setPhase("setup");

      if (marketTargets.length === 0) {
        toast.info("No matching companies found for this domain's keywords.");
      }
    } else {
      // Web search strategies - run incrementally with progress
      setPhase("searching");
      setSearchQueries([]);
      setTotalDomainsFound(0);
      setUniqueDomains(new Set());

      try {
        // Step 1: Get the search queries for this strategy
        const queriesResponse = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get-queries",
            strategy,
            domainName: selectedDomain.name,
          }),
        });

        if (!queriesResponse.ok) {
          throw new Error("Failed to generate search queries");
        }

        const queriesData = (await queriesResponse.json()) as GetQueriesResponse;
        const queries = queriesData.queries;

        // Initialize query progress
        const initialProgress: SearchQueryProgress[] = queries.map((q) => ({
          query: q,
          status: "pending",
          resultCount: 0,
        }));
        setSearchQueries(initialProgress);

        // Step 2: Run each query and update progress
        const allResults: SearchResult[] = [];
        const seenDomains = new Set<string>();

        for (let i = 0; i < queries.length; i++) {
          const query = queries[i];

          // Update status to searching
          setSearchQueries((prev) =>
            prev.map((q, idx) =>
              idx === i ? { ...q, status: "searching" } : q
            )
          );

          try {
            const searchResponse = await fetch("/api/search", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "run-query",
                query,
                maxResults: 8,
              }),
            });

            if (!searchResponse.ok) {
              throw new Error("Search request failed");
            }

            const searchData = (await searchResponse.json()) as RunQueryResponse;

            // Count new unique domains
            let newDomains = 0;
            for (const result of searchData.results) {
              if (!seenDomains.has(result.domain)) {
                seenDomains.add(result.domain);
                allResults.push(result);
                newDomains++;
              }
            }

            // Update progress
            setSearchQueries((prev) =>
              prev.map((q, idx) =>
                idx === i
                  ? { ...q, status: "done", resultCount: searchData.resultCount }
                  : q
              )
            );
            setTotalDomainsFound((prev) => prev + searchData.resultCount);
            setUniqueDomains(new Set(seenDomains));
          } catch (error) {
            console.error(`Search failed for "${query}":`, error);
            setSearchQueries((prev) =>
              prev.map((q, idx) =>
                idx === i ? { ...q, status: "error", resultCount: 0 } : q
              )
            );
          }

          // Small delay between queries
          if (i < queries.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // Convert results to targets
        const strategyTargets: StrategyTarget[] = allResults.map((r) => ({
          name: r.title || r.domain,
          url: r.url,
          category: getCategoryForStrategy(strategy),
          salesPitch: getSalesPitchForStrategy(strategy),
          snippet: r.snippet,
        }));

        setTargets(strategyTargets);
        setSelectedTargets(new Set(strategyTargets.map((t) => t.url)));
        setPhase("setup");

        if (strategyTargets.length === 0) {
          toast.info("No results found. Try adding custom URLs or a different strategy.");
        }
      } catch (error) {
        console.error("Search error:", error);
        toast.error(error instanceof Error ? error.message : "Search failed");
        setPhase("strategy");
      }
    }
  };

  // Handlers
  const toggleTarget = (url: string) => {
    const newSelected = new Set(selectedTargets);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelectedTargets(newSelected);
  };

  const addCustomUrl = () => {
    if (!customUrl) return;

    try {
      new URL(customUrl);
      const newTarget: StrategyTarget = {
        name: new URL(customUrl).hostname.replace("www.", ""),
        url: customUrl,
        category: "Custom",
      };

      if (!targets.find((t) => t.url === customUrl)) {
        setTargets([...targets, newTarget]);
        setSelectedTargets(new Set([...selectedTargets, customUrl]));
      }
      setCustomUrl("");
    } catch {
      toast.error("Invalid URL");
    }
  };

  const startScraping = async () => {
    if (selectedTargets.size === 0) {
      toast.error("Please select at least one target");
      return;
    }

    setPhase("scraping");
    const selectedCompanies = targets.filter((t) => selectedTargets.has(t.url));
    const newProgress: ScrapeProgress[] = selectedCompanies.map((c) => ({
      company: c.name,
      status: "pending" as const,
      contactsFound: 0,
    }));
    setProgress(newProgress);

    const allContacts: ScrapedContact[] = [];

    // Scrape each company sequentially
    for (let i = 0; i < selectedCompanies.length; i++) {
      const company = selectedCompanies[i];

      // Update progress to "scraping"
      setProgress((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, status: "scraping" as const } : p))
      );

      try {
        const response = await fetch("/api/scraper", {
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
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.contacts) {
          // Add company name to contacts
          const companyContacts = data.contacts.map((c: ScrapedContact) => ({
            ...c,
            company: company.name,
          }));
          allContacts.push(...companyContacts);

          setProgress((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? { ...p, status: "done" as const, contactsFound: companyContacts.length }
                : p
            )
          );
        } else {
          throw new Error(data.error || "Unknown error");
        }
      } catch (err) {
        setProgress((prev) =>
          prev.map((p, idx) =>
            idx === i
              ? {
                  ...p,
                  status: "error" as const,
                  error: err instanceof Error ? err.message : "Failed",
                }
              : p
          )
        );
      }

      // Small delay between requests
      if (i < selectedCompanies.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Deduplicate contacts and sort by priority (phone+email first)
    const deduped = deduplicateContacts(allContacts);
    const sorted = sortContactsByPriority(deduped);
    setContacts(sorted);

    // Auto-select contacts with email (skip careers@ type emails)
    const autoSelected = new Set<string>();
    sorted.forEach((c) => {
      if (c.email && !c.email.toLowerCase().startsWith("careers@")) {
        autoSelected.add(getContactKey(c));
      }
    });
    setSelectedContacts(autoSelected);

    setPhase("results");
  };

  const deduplicateContacts = (contacts: ScrapedContact[]): ScrapedContact[] => {
    const seen = new Map<string, ScrapedContact>();
    for (const contact of contacts) {
      const key = contact.email || contact.phone || "";
      if (key && !seen.has(key)) {
        seen.set(key, contact);
      } else if (key && seen.has(key)) {
        // Merge: prefer contact with more info
        const existing = seen.get(key)!;
        if (!existing.phone && contact.phone) {
          seen.set(key, { ...existing, phone: contact.phone });
        }
      }
    }
    return Array.from(seen.values());
  };

  const sortContactsByPriority = (contacts: ScrapedContact[]): ScrapedContact[] => {
    return contacts.sort((a, b) => {
      // Contacts with both email AND phone come first
      const aScore = (a.email ? 1 : 0) + (a.phone ? 2 : 0);
      const bScore = (b.email ? 1 : 0) + (b.phone ? 2 : 0);
      return bScore - aScore;
    });
  };

  const getContactKey = (contact: ScrapedContact): string => {
    return contact.email || contact.phone || `${contact.company}-${contact.source_url}`;
  };

  const toggleContact = (contact: ScrapedContact) => {
    const key = getContactKey(contact);
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedContacts(newSelected);
  };

  const selectAllWithPhone = () => {
    const withPhone = new Set<string>();
    contacts.forEach((c) => {
      if (c.phone && c.email) {
        withPhone.add(getContactKey(c));
      }
    });
    setSelectedContacts(withPhone);
  };

  const selectAll = () => {
    const all = new Set<string>();
    contacts.forEach((c) => {
      if (c.email && !c.email.toLowerCase().startsWith("careers@")) {
        all.add(getContactKey(c));
      }
    });
    setSelectedContacts(all);
  };

  const importSelectedLeads = async () => {
    if (!selectedDomain) {
      toast.error("No domain selected");
      return;
    }

    const selectedList = contacts.filter((c) => selectedContacts.has(getContactKey(c)));
    if (selectedList.length === 0) {
      toast.error("No contacts selected");
      return;
    }

    setIsImporting(true);

    try {
      const leadsToCreate = selectedList.map((c) => ({
        email: c.email || null,
        phone: c.phone || null,
        first_name: null,
        last_name: null,
        company_name: c.company || null,
        domain_id: selectedDomain.id,
        source: "scraped" as const,
        status: "new" as const,
      }));

      await bulkCreateLeads.mutateAsync(leadsToCreate);

      const withPhone = selectedList.filter((c) => c.phone && c.email).length;
      toast.success(
        `Imported ${selectedList.length} leads (${withPhone} with phone for multi-channel outreach)`
      );
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import leads");
    } finally {
      setIsImporting(false);
    }
  };

  const goBackToStrategy = () => {
    setPhase("strategy");
    setSelectedStrategy(null);
    setTargets([]);
    setSelectedTargets(new Set());
    setSearchQueries([]);
    setTotalDomainsFound(0);
    setUniqueDomains(new Set());
  };

  // Computed values
  const contactsWithPhone = contacts.filter((c) => c.phone && c.email);
  const contactsEmailOnly = contacts.filter((c) => c.email && !c.phone);
  const selectedCount = selectedContacts.size;
  const selectedWithPhone = contacts.filter(
    (c) => c.phone && c.email && selectedContacts.has(getContactKey(c))
  ).length;

  // Search progress computed values
  const completedQueries = searchQueries.filter((q) => q.status === "done" || q.status === "error").length;
  const currentQuery = searchQueries.find((q) => q.status === "searching");

  // Get current strategy info
  const currentStrategy = selectedStrategy
    ? LEAD_STRATEGIES.find((s) => s.id === selectedStrategy)
    : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {phase === "results"
              ? `Found ${contacts.length} contacts`
              : phase === "strategy"
              ? "Choose Lead Strategy"
              : phase === "searching"
              ? "Searching for Companies"
              : `Find Leads${selectedDomain ? ` for ${selectedDomain.full_domain}` : ""}`}
          </DialogTitle>
          <DialogDescription>
            {phase === "strategy" && "Select a strategy to find the most relevant leads"}
            {phase === "searching" && (
              <span className="flex items-center gap-2">
                <Badge variant="outline">{currentStrategy?.name}</Badge>
                Running web searches to find potential buyers...
              </span>
            )}
            {phase === "setup" && currentStrategy && (
              <span className="flex items-center gap-2">
                <Badge variant="outline">{currentStrategy.name}</Badge>
                {currentStrategy.shortDescription}
              </span>
            )}
            {phase === "scraping" && "Scraping websites for contact information..."}
            {phase === "results" && "Review and import the contacts found"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {/* Strategy Selection Phase */}
          {phase === "strategy" && (
            <div className="space-y-6">
              {/* Domain Selector (for Leads page) */}
              {showDomainSelector && (
                <div className="space-y-2">
                  <Label>Select Domain</Label>
                  <Select
                    value={selectedDomain?.id || ""}
                    onValueChange={(id) => {
                      const d = domains.find((d) => d.id === id);
                      setSelectedDomain(d || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a domain..." />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.full_domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Strategy Cards */}
              {selectedDomain && (
                <div className="space-y-3">
                  {LEAD_STRATEGIES.map((strategy) => {
                    const Icon = STRATEGY_ICONS[strategy.id];
                    const usesWebSearch = strategy.id !== "market-leaders";

                    return (
                      <div
                        key={strategy.id}
                        onClick={() => handleStrategySelect(strategy.id)}
                        className="relative p-4 border rounded-lg cursor-pointer transition-all hover:border-primary hover:bg-muted/50"
                      >
                        {usesWebSearch && (
                          <Badge className="absolute top-2 right-2" variant="secondary">
                            <Globe className="h-3 w-3 mr-1" />
                            Web Search
                          </Badge>
                        )}
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-md bg-muted">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0 pr-24">
                            <h4 className="font-semibold">{strategy.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {strategy.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No domain selected */}
              {!selectedDomain && showDomainSelector && (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Select a domain to choose a lead strategy.</p>
                </div>
              )}
            </div>
          )}

          {/* Searching Phase - Detailed Progress */}
          {phase === "searching" && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{completedQueries}/{searchQueries.length}</p>
                  <p className="text-xs text-muted-foreground">Searches Complete</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{totalDomainsFound}</p>
                  <p className="text-xs text-muted-foreground">Results Found</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{uniqueDomains.size}</p>
                  <p className="text-xs text-muted-foreground">Unique Companies</p>
                </div>
              </div>

              {/* Current Query */}
              {currentQuery && (
                <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium">Searching:</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    {currentQuery.query}
                  </p>
                </div>
              )}

              {/* Query List */}
              <div className="space-y-2">
                <Label className="text-sm">Search Queries</Label>
                <div className="space-y-1">
                  {searchQueries.map((q, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                        q.status === "searching"
                          ? "bg-primary/10 border border-primary/20"
                          : q.status === "done"
                          ? "bg-muted/50"
                          : q.status === "error"
                          ? "bg-destructive/10"
                          : ""
                      }`}
                    >
                      {q.status === "pending" && (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      {q.status === "searching" && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {q.status === "done" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {q.status === "error" && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="flex-1 font-mono text-xs break-all">
                        {q.query}
                      </span>
                      {q.status === "done" && (
                        <Badge variant="secondary" className="text-xs">
                          {q.resultCount} found
                        </Badge>
                      )}
                      {q.status === "error" && (
                        <Badge variant="destructive" className="text-xs">
                          failed
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Setup Phase */}
          {phase === "setup" && (
            <div className="space-y-6">
              {/* Search Summary (for web search strategies) */}
              {searchQueries.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <p className="text-sm">
                    <span className="font-medium">Search complete:</span>{" "}
                    Found {uniqueDomains.size} unique companies from {searchQueries.length} searches
                  </p>
                </div>
              )}

              {/* Keywords Detected (for market leaders) */}
              {keywords.length > 0 && selectedStrategy === "market-leaders" && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Keywords detected</Label>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((kw) => (
                      <Badge key={kw} variant="secondary">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sales Pitch for Strategy */}
              {currentStrategy && (
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <p className="text-sm font-medium">Sales Talking Point:</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentStrategy.salesPitch}
                  </p>
                </div>
              )}

              {/* Target Companies */}
              {targets.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Companies Found ({targets.length})</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedTargets(
                          selectedTargets.size === targets.length
                            ? new Set()
                            : new Set(targets.map((t) => t.url))
                        )
                      }
                    >
                      {selectedTargets.size === targets.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="border rounded-md max-h-[250px] overflow-y-auto">
                    {targets.map((target) => (
                      <div
                        key={target.url}
                        className="flex items-start gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                        onClick={() => toggleTarget(target.url)}
                      >
                        <Checkbox
                          checked={selectedTargets.has(target.url)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm break-words">{target.name}</p>
                          <p className="text-xs text-muted-foreground break-all">{target.url}</p>
                          {target.snippet && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {target.snippet}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {target.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom URL */}
              <div className="space-y-2">
                <Label>Add Custom URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomUrl()}
                  />
                  <Button variant="outline" onClick={addCustomUrl}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* No targets message */}
              {targets.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No companies found from web search.</p>
                  <p className="text-sm">Try a different strategy or add custom URLs to scrape.</p>
                </div>
              )}
            </div>
          )}

          {/* Scraping Phase */}
          {phase === "scraping" && (
            <div className="space-y-3">
              {progress.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 border rounded-md"
                >
                  {p.status === "pending" && (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  {p.status === "scraping" && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {p.status === "done" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {p.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                  <span className="flex-1 break-words">{p.company}</span>
                  {p.status === "done" && (
                    <span className="text-sm text-muted-foreground">
                      {p.contactsFound} contacts
                    </span>
                  )}
                  {p.status === "error" && (
                    <span className="text-sm text-red-500">{p.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Results Phase */}
          {phase === "results" && (
            <div className="space-y-4">
              {/* Priority Section: With Phone */}
              {contactsWithPhone.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <Label className="font-semibold">
                      With Phone ({contactsWithPhone.length}) - Best for email + voicemail
                    </Label>
                  </div>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]"></TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Phone</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactsWithPhone.map((contact, i) => (
                          <TableRow
                            key={i}
                            className="cursor-pointer"
                            onClick={() => toggleContact(contact)}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedContacts.has(getContactKey(contact))}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {contact.email}
                            </TableCell>
                            <TableCell>{contact.company}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {contact.phone}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Email Only Section */}
              {contactsEmailOnly.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <Label>Email Only ({contactsEmailOnly.length})</Label>
                  </div>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]"></TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Source</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactsEmailOnly.map((contact, i) => (
                          <TableRow
                            key={i}
                            className="cursor-pointer"
                            onClick={() => toggleContact(contact)}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedContacts.has(getContactKey(contact))}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {contact.email}
                            </TableCell>
                            <TableCell>{contact.company}</TableCell>
                            <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {new URL(contact.source_url).hostname}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {contacts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No contacts found from the scraped websites.</p>
                  <p className="text-sm">Try adding different target URLs.</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          {phase === "strategy" && (
            <>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <div className="text-sm text-muted-foreground">
                {selectedDomain ? "Choose a strategy above" : "Select a domain first"}
              </div>
            </>
          )}

          {phase === "searching" && (
            <>
              <Button variant="ghost" onClick={goBackToStrategy}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <div className="text-sm text-muted-foreground">
                {completedQueries} of {searchQueries.length} searches complete
              </div>
            </>
          )}

          {phase === "setup" && (
            <>
              <Button variant="ghost" onClick={goBackToStrategy}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Change Strategy
              </Button>
              <Button
                onClick={startScraping}
                disabled={selectedTargets.size === 0 || !selectedDomain}
              >
                <Search className="mr-2 h-4 w-4" />
                Start Scraping ({selectedTargets.size} sites)
              </Button>
            </>
          )}

          {phase === "scraping" && (
            <>
              <div className="text-sm text-muted-foreground">
                {progress.filter((p) => p.status === "done").length} of {progress.length} complete
              </div>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </>
          )}

          {phase === "results" && (
            <>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Selected: {selectedCount} of {contacts.length}
                  {selectedWithPhone > 0 && ` (${selectedWithPhone} with phone)`}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllWithPhone}>
                    Phone Only
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    All Emails
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setPhase("setup")}>
                  Back
                </Button>
                <Button onClick={importSelectedLeads} disabled={selectedCount === 0 || isImporting}>
                  {isImporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Import {selectedCount} Leads
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions
function getCategoryForStrategy(strategy: LeadStrategy): string {
  switch (strategy) {
    case "domain-upgrade":
      return "Domain Upgrade";
    case "seo-bidders":
      return "SEO Competitor";
    case "emerging-startups":
      return "Startup";
    default:
      return "Company";
  }
}

function getSalesPitchForStrategy(strategy: LeadStrategy): string {
  switch (strategy) {
    case "domain-upgrade":
      return "Upgrade to the premium, exact-match domain";
    case "seo-bidders":
      return "Own direct type-in traffic instead of paying per click";
    case "emerging-startups":
      return "Secure the premium domain early";
    default:
      return "Premium domain opportunity";
  }
}
