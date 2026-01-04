"use client";

import { useState, useEffect } from "react";
import { useJobsStore, type Job } from "@/stores/useJobsStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Maximize2,
  X,
  Search,
  UserPlus,
  CheckCircle2,
  XCircle,
  Phone,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface MinimizedJobCardProps {
  job: Job;
  onMaximize: () => void;
  onDismiss: () => void;
}

function MinimizedJobCard({ job, onMaximize, onDismiss }: MinimizedJobCardProps) {
  if (job.type !== "lead-scraping") return null;

  const isSearching = job.status === "searching";
  const isScraping = job.status === "scraping";
  const isDone = job.status === "done";
  const isError = job.status === "error";

  // Calculate progress percentage
  let progressPercent = 0;
  let statusText = "";

  if (isSearching) {
    progressPercent = job.searchQueriesTotal > 0
      ? (job.searchQueriesComplete / job.searchQueriesTotal) * 100
      : 0;
    statusText = `Searching ${job.searchQueriesComplete}/${job.searchQueriesTotal}`;
  } else if (isScraping) {
    progressPercent = job.sitesTotal > 0
      ? (job.sitesComplete / job.sitesTotal) * 100
      : 0;
    statusText = `Scraping ${job.sitesComplete}/${job.sitesTotal}`;
  } else if (isDone) {
    progressPercent = 100;
    statusText = "Complete";
  } else if (isError) {
    statusText = "Failed";
  }

  // Completed job card - success toast style
  if (isDone) {
    return (
      <div className={`border rounded-lg shadow-lg min-w-[320px] max-w-[420px] overflow-hidden ${
        job.totalLeadsAdded > 0
          ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
          : "bg-background border-border"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 p-3 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${
              job.totalLeadsAdded > 0 ? "text-green-600" : "text-muted-foreground"
            }`} />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">
                {job.totalLeadsAdded > 0
                  ? `${job.totalLeadsAdded} Leads Added`
                  : "No Contacts Found"
                }
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {job.domainName} • {job.strategyName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Results summary */}
        {job.totalLeadsAdded > 0 && (
          <div className="px-3 pb-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <UserPlus className="h-3 w-3" />
                {job.totalLeadsAdded} total
              </span>
              {job.leadsWithPhone > 0 && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {job.leadsWithPhone} with phone
                </span>
              )}
              <span>
                {job.sitesComplete} sites scraped
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onMaximize}
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            View Details
          </Button>
          {job.totalLeadsAdded > 0 && (
            <Link href="/leads">
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs"
                onClick={onDismiss}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Leads
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Active job card (searching/scraping)
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[300px] max-w-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {(isSearching || isScraping) && (
            <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
          )}
          {isError && (
            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          )}
          <span className="font-medium text-sm truncate">
            {job.domainName}
          </span>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {job.strategyName}
          </Badge>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMaximize}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      {(isSearching || isScraping) && (
        <Progress value={progressPercent} className="h-1.5 mb-2" />
      )}

      {/* Status row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          {isSearching && <Search className="h-3 w-3" />}
          {isSearching && statusText}
          {isScraping && job.currentSite && (
            <span className="truncate max-w-[150px]">{job.currentSite}</span>
          )}
          {isScraping && !job.currentSite && statusText}
          {isError && statusText}
        </span>

        {job.totalLeadsAdded > 0 && (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <UserPlus className="h-3 w-3" />
            {job.totalLeadsAdded} leads
          </span>
        )}
      </div>
    </div>
  );
}

export function MinimizedJobs() {
  const [mounted, setMounted] = useState(false);
  const jobs = useJobsStore((state) => state.jobs);
  const minimizedJobs = useJobsStore((state) => state.minimizedJobs);
  const maximizeJob = useJobsStore((state) => state.maximizeJob);
  const removeJob = useJobsStore((state) => state.removeJob);

  // Prevent hydration mismatch - only render after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get minimized jobs
  const minimizedJobsList = mounted
    ? Array.from(jobs.values()).filter((job) => minimizedJobs.has(job.id))
    : [];

  if (!mounted || minimizedJobsList.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {minimizedJobsList.map((job) => (
        <MinimizedJobCard
          key={job.id}
          job={job}
          onMaximize={() => maximizeJob(job.id)}
          onDismiss={() => removeJob(job.id)}
        />
      ))}
    </div>
  );
}
