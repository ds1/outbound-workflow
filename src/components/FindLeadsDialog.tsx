"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Search,
  Plus,
  Phone,
  CheckCircle2,
  XCircle,
  ArrowUpCircle,
  Building2,
  Rocket,
  ArrowLeft,
  Globe,
  Circle,
  UserPlus,
  Minimize2,
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
import {
  useJobsStore,
  type LeadScrapingJob,
  type ScrapeJobProgress,
} from "@/stores/useJobsStore";

interface ScrapedContact {
  email?: string;
  phone?: string;
  name?: string;
  company?: string;
  source_url: string;
}

interface FindLeadsDialogProps {
  domain?: Domain | null;
  open: boolean;
  onClose: () => void;
  showDomainSelector?: boolean;
  resumeJobId?: string;
}

type Phase = "strategy" | "setup" | "searching" | "scraping" | "done";

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
  resumeJobId,
}: FindLeadsDialogProps) {
  // Job store
  const jobs = useJobsStore((state) => state.jobs);
  const minimizedJobs = useJobsStore((state) => state.minimizedJobs);
  const addJob = useJobsStore((state) => state.addJob);
  const updateJob = useJobsStore((state) => state.updateJob);
  const minimizeJob = useJobsStore((state) => state.minimizeJob);
  const removeJob = useJobsStore((state) => state.removeJob);

  // Local state for phases before job starts
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(initialDomain || null);
  const [selectedStrategy, setSelectedStrategy] = useState<LeadStrategy | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [targets, setTargets] = useState<StrategyTarget[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [customUrl, setCustomUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("strategy");

  // Current job ID when running
  const [currentJobId, setCurrentJobId] = useState<string | null>(resumeJobId || null);

  // Get current job from store
  const currentJob = currentJobId ? jobs.get(currentJobId) as LeadScrapingJob | undefined : undefined;

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

  // Check if we should show a resumed job
  useEffect(() => {
    if (resumeJobId && jobs.has(resumeJobId)) {
      setCurrentJobId(resumeJobId);
      const job = jobs.get(resumeJobId) as LeadScrapingJob;
      if (job.status === "searching") {
        setPhase("searching");
      } else if (job.status === "scraping") {
        setPhase("scraping");
      } else if (job.status === "done") {
        setPhase("done");
      }
    }
  }, [resumeJobId, jobs]);

  // Reset state when dialog closes (but don't clear job)
  useEffect(() => {
    if (!open && !currentJobId) {
      setPhase("strategy");
      setSelectedStrategy(null);
      setCustomUrl("");
      setTargets([]);
      setSelectedTargets(new Set());
      if (!showDomainSelector) {
        setSelectedDomain(initialDomain || null);
      }
    } else if (initialDomain && !currentJobId) {
      setSelectedDomain(initialDomain);
    }
  }, [open, initialDomain, showDomainSelector, currentJobId]);

  // Generate targets when strategy is selected
  const handleStrategySelect = async (strategy: LeadStrategy) => {
    if (!selectedDomain) return;

    setSelectedStrategy(strategy);

    if (strategy === "market-leaders") {
      const marketTargets = generateMarketLeaderTargets(selectedDomain);
      setTargets(marketTargets);
      setSelectedTargets(new Set(marketTargets.map((t) => t.url)));
      setPhase("setup");

      if (marketTargets.length === 0) {
        toast.info("No matching companies found for this domain's keywords.");
      }
    } else {
      // Create a job for web search
      const jobId = `lead-scraping-${Date.now()}`;
      const strategyInfo = LEAD_STRATEGIES.find((s) => s.id === strategy);

      const newJob: LeadScrapingJob = {
        id: jobId,
        type: "lead-scraping",
        status: "searching",
        domainName: selectedDomain.full_domain || selectedDomain.name || "",
        strategyName: strategyInfo?.name || strategy,
        searchQueriesTotal: 0,
        searchQueriesComplete: 0,
        sitesTotal: 0,
        sitesComplete: 0,
        progress: [],
        totalLeadsAdded: 0,
        leadsWithPhone: 0,
        startedAt: new Date(),
      };

      addJob(newJob);
      setCurrentJobId(jobId);
      setPhase("searching");

      try {
        // Get search queries
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

        updateJob(jobId, { searchQueriesTotal: queries.length });

        // Run searches
        const allResults: SearchResult[] = [];
        const seenDomains = new Set<string>();

        for (let i = 0; i < queries.length; i++) {
          const query = queries[i];

          updateJob(jobId, {
            currentSearchQuery: query,
            searchQueriesComplete: i,
          });

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

            if (searchResponse.ok) {
              const searchData = (await searchResponse.json()) as RunQueryResponse;
              for (const result of searchData.results) {
                if (!seenDomains.has(result.domain)) {
                  seenDomains.add(result.domain);
                  allResults.push(result);
                }
              }
            }
          } catch (error) {
            console.error(`Search failed for "${query}":`, error);
          }

          updateJob(jobId, { searchQueriesComplete: i + 1 });

          if (i < queries.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // Convert to targets
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

        // Clear job ID since we're back to setup (not running)
        removeJob(jobId);
        setCurrentJobId(null);

        if (strategyTargets.length === 0) {
          toast.info("No results found. Try adding custom URLs or a different strategy.");
        }
      } catch (error) {
        console.error("Search error:", error);
        toast.error(error instanceof Error ? error.message : "Search failed");
        removeJob(jobId);
        setCurrentJobId(null);
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

    if (!selectedDomain) {
      toast.error("No domain selected");
      return;
    }

    const selectedCompanies = targets.filter((t) => selectedTargets.has(t.url));
    const strategyInfo = selectedStrategy
      ? LEAD_STRATEGIES.find((s) => s.id === selectedStrategy)
      : null;

    // Create job
    const jobId = `lead-scraping-${Date.now()}`;
    const initialProgress: ScrapeJobProgress[] = selectedCompanies.map((c) => ({
      company: c.name,
      status: "pending" as const,
      leadsAdded: 0,
    }));

    const newJob: LeadScrapingJob = {
      id: jobId,
      type: "lead-scraping",
      status: "scraping",
      domainName: selectedDomain.full_domain || selectedDomain.name || "",
      strategyName: strategyInfo?.name || "Custom",
      searchQueriesTotal: 0,
      searchQueriesComplete: 0,
      sitesTotal: selectedCompanies.length,
      sitesComplete: 0,
      progress: initialProgress,
      totalLeadsAdded: 0,
      leadsWithPhone: 0,
      startedAt: new Date(),
    };

    addJob(newJob);
    setCurrentJobId(jobId);
    setPhase("scraping");

    let totalAdded = 0;
    let withPhone = 0;
    const seenEmails = new Set<string>();

    // Scrape each company
    for (let i = 0; i < selectedCompanies.length; i++) {
      const company = selectedCompanies[i];

      // Update progress
      const newProgress = [...initialProgress];
      newProgress[i] = { ...newProgress[i], status: "scraping" };
      updateJob(jobId, {
        currentSite: company.name,
        progress: newProgress,
      });

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

        if (data.success && data.contacts && data.contacts.length > 0) {
          const validContacts = data.contacts.filter((c: ScrapedContact) => {
            if (!c.email) return false;
            const emailLower = c.email.toLowerCase();
            if (emailLower.startsWith("careers@")) return false;
            if (emailLower.startsWith("jobs@")) return false;
            if (emailLower.startsWith("hr@")) return false;
            if (emailLower.startsWith("recruiting@")) return false;
            if (seenEmails.has(emailLower)) return false;
            seenEmails.add(emailLower);
            return true;
          });

          if (validContacts.length > 0) {
            const leadsToCreate = validContacts.map((c: ScrapedContact) => ({
              email: c.email || null,
              phone: c.phone || null,
              first_name: null,
              last_name: null,
              company_name: company.name,
              domain_id: selectedDomain.id,
              source: "scraped" as const,
              status: "new" as const,
            }));

            try {
              await bulkCreateLeads.mutateAsync(leadsToCreate);
              totalAdded += validContacts.length;
              withPhone += validContacts.filter((c: ScrapedContact) => c.phone).length;

              newProgress[i] = { ...newProgress[i], status: "done", leadsAdded: validContacts.length };
            } catch (err) {
              newProgress[i] = { ...newProgress[i], status: "error", error: "Failed to save" };
            }
          } else {
            newProgress[i] = { ...newProgress[i], status: "done", leadsAdded: 0 };
          }
        } else {
          newProgress[i] = { ...newProgress[i], status: "done", leadsAdded: 0 };
        }
      } catch (err) {
        newProgress[i] = {
          ...newProgress[i],
          status: "error",
          error: err instanceof Error ? err.message : "Failed",
        };
      }

      updateJob(jobId, {
        sitesComplete: i + 1,
        progress: [...newProgress],
        totalLeadsAdded: totalAdded,
        leadsWithPhone: withPhone,
      });

      if (i < selectedCompanies.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Mark complete
    updateJob(jobId, {
      status: "done",
      currentSite: undefined,
      completedAt: new Date(),
    });

    setPhase("done");

    if (totalAdded > 0) {
      toast.success(`Added ${totalAdded} leads (${withPhone} with phone numbers)`);
    } else {
      toast.info("No contacts found from the selected websites.");
    }
  };

  const handleMinimize = () => {
    if (currentJobId) {
      minimizeJob(currentJobId);
      onClose();
    }
  };

  const goBackToStrategy = () => {
    if (currentJobId) {
      removeJob(currentJobId);
      setCurrentJobId(null);
    }
    setPhase("strategy");
    setSelectedStrategy(null);
    setTargets([]);
    setSelectedTargets(new Set());
  };

  const handleClose = () => {
    // Don't remove the job - let user dismiss from minimized view
    // Just close the dialog
    if (currentJobId && currentJob?.status === "done") {
      // Keep job in store but minimize it so user can see results
      minimizeJob(currentJobId);
    }
    setCurrentJobId(null);
    onClose();
  };

  // Get current strategy info
  const currentStrategy = selectedStrategy
    ? LEAD_STRATEGIES.find((s) => s.id === selectedStrategy)
    : null;

  // Calculate progress for display
  const searchProgress = currentJob?.searchQueriesTotal
    ? (currentJob.searchQueriesComplete / currentJob.searchQueriesTotal) * 100
    : 0;
  const scrapeProgress = currentJob?.sitesTotal
    ? (currentJob.sitesComplete / currentJob.sitesTotal) * 100
    : 0;

  const canMinimize = phase === "searching" || phase === "scraping" || phase === "done";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {phase === "done"
                ? `Added ${currentJob?.totalLeadsAdded || 0} Leads`
                : phase === "strategy"
                ? "Choose Lead Strategy"
                : phase === "searching"
                ? "Searching for Companies"
                : phase === "scraping"
                ? "Finding Contacts"
                : `Find Leads${selectedDomain ? ` for ${selectedDomain.full_domain}` : ""}`}
            </DialogTitle>
            {canMinimize && (
              <Button variant="ghost" size="icon" onClick={handleMinimize} className="h-8 w-8">
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <DialogDescription>
            {phase === "strategy" && "Select a strategy to find the most relevant leads"}
            {phase === "searching" && (
              <span className="flex items-center gap-2">
                <Badge variant="outline">{currentJob?.strategyName || currentStrategy?.name}</Badge>
                Running web searches to find potential buyers...
              </span>
            )}
            {phase === "setup" && currentStrategy && (
              <span className="flex items-center gap-2">
                <Badge variant="outline">{currentStrategy.name}</Badge>
                {currentStrategy.shortDescription}
              </span>
            )}
            {phase === "scraping" && "Scraping websites and adding contacts to your leads..."}
            {phase === "done" && "Lead discovery complete. View your new leads in the Leads page."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {/* Strategy Selection Phase */}
          {phase === "strategy" && (
            <div className="space-y-6 py-2">
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

              {!selectedDomain && showDomainSelector && (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Select a domain to choose a lead strategy.</p>
                </div>
              )}
            </div>
          )}

          {/* Searching Phase */}
          {phase === "searching" && currentJob && (
            <div className="space-y-6 py-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Searching for companies...</span>
                  <span className="text-muted-foreground">
                    {currentJob.searchQueriesComplete}/{currentJob.searchQueriesTotal}
                  </span>
                </div>
                <Progress value={searchProgress} className="h-2" />
              </div>

              {currentJob.currentSearchQuery && (
                <div className="p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium">Current query:</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 font-mono break-all">
                    {currentJob.currentSearchQuery}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Setup Phase */}
          {phase === "setup" && (
            <div className="space-y-4 py-2">
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

              {targets.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Companies to Scrape ({selectedTargets.size} selected)</Label>
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
                  <div className="border rounded-md max-h-[200px] overflow-y-auto">
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
                          <p className="font-medium text-sm truncate">{target.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{target.url}</p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {target.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              {targets.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No companies found from web search.</p>
                  <p className="text-sm">Try a different strategy or add custom URLs to scrape.</p>
                </div>
              )}
            </div>
          )}

          {/* Scraping Phase */}
          {phase === "scraping" && currentJob && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{currentJob.sitesComplete}/{currentJob.sitesTotal}</p>
                  <p className="text-xs text-muted-foreground">Sites Scraped</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{currentJob.totalLeadsAdded}</p>
                  <p className="text-xs text-muted-foreground">Leads Added</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{currentJob.leadsWithPhone}</p>
                  <p className="text-xs text-muted-foreground">With Phone</p>
                </div>
              </div>

              <Progress value={scrapeProgress} className="h-2" />

              {currentJob.currentSite && (
                <div className="p-3 border rounded-lg bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm truncate">{currentJob.currentSite}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {currentJob.progress.map((p, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                      p.status === "scraping" ? "bg-primary/5" : ""
                    }`}
                  >
                    {p.status === "pending" && <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    {p.status === "scraping" && <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />}
                    {p.status === "done" && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
                    {p.status === "error" && <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                    <span className="flex-1 text-sm truncate">{p.company}</span>
                    {p.status === "done" && p.leadsAdded > 0 && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        <UserPlus className="h-3 w-3 mr-1" />
                        {p.leadsAdded}
                      </Badge>
                    )}
                    {p.status === "done" && p.leadsAdded === 0 && (
                      <span className="text-xs text-muted-foreground">No contacts</span>
                    )}
                    {p.status === "error" && (
                      <span className="text-xs text-red-500">{p.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Done Phase */}
          {phase === "done" && currentJob && (
            <div className="space-y-6 py-4">
              <div className="text-center py-6">
                {currentJob.totalLeadsAdded > 0 ? (
                  <>
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">{currentJob.totalLeadsAdded} Leads Added</h3>
                    <p className="text-muted-foreground mt-2">
                      {currentJob.leadsWithPhone > 0 && (
                        <span className="flex items-center justify-center gap-2">
                          <Phone className="h-4 w-4" />
                          {currentJob.leadsWithPhone} with phone numbers
                        </span>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">No Contacts Found</h3>
                    <p className="text-muted-foreground mt-2">
                      Try a different strategy or add company websites directly.
                    </p>
                  </>
                )}
              </div>

              <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                {currentJob.progress.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2">
                    {p.status === "done" && p.leadsAdded > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : p.status === "error" ? (
                      <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="flex-1 text-sm truncate">{p.company}</span>
                    {p.leadsAdded > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {p.leadsAdded} leads
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t mt-2 flex-shrink-0">
          {phase === "strategy" && (
            <>
              <Button variant="ghost" onClick={handleClose}>
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
              <Button variant="outline" onClick={handleMinimize}>
                <Minimize2 className="mr-2 h-4 w-4" />
                Minimize
              </Button>
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
                Scrape {selectedTargets.size} Sites
              </Button>
            </>
          )}

          {phase === "scraping" && (
            <>
              <div className="text-sm text-muted-foreground">
                {currentJob?.sitesComplete} of {currentJob?.sitesTotal} complete
              </div>
              <Button variant="outline" onClick={handleMinimize}>
                <Minimize2 className="mr-2 h-4 w-4" />
                Minimize
              </Button>
            </>
          )}

          {phase === "done" && (
            <>
              <Button variant="ghost" onClick={goBackToStrategy}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Find More
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleMinimize}>
                  <Minimize2 className="mr-2 h-4 w-4" />
                  Minimize
                </Button>
                <Button onClick={() => {
                  if (currentJobId) {
                    removeJob(currentJobId);
                    setCurrentJobId(null);
                  }
                  onClose();
                }}>
                  Dismiss
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
