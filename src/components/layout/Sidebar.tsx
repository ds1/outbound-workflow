"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Users,
  Mail,
  FileText,
  Settings,
  LayoutDashboard,
  Phone,
  AlertTriangle,
  BarChart3,
  Loader2,
  Search,
  CheckCircle2,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobsStore } from "@/stores/useJobsStore";
import { Progress } from "@/components/ui/progress";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Domains", href: "/domains", icon: Globe },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Campaigns", href: "/campaigns", icon: Mail },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Escalations", href: "/escalations", icon: AlertTriangle },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const jobs = useJobsStore((state) => state.jobs);
  const minimizedJobs = useJobsStore((state) => state.minimizedJobs);
  const maximizeJob = useJobsStore((state) => state.maximizeJob);

  // Prevent hydration mismatch - only render jobs after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get active or minimized jobs (including completed ones that haven't been dismissed)
  const activeJobs = mounted
    ? Array.from(jobs.values()).filter(
        (job) => minimizedJobs.has(job.id) || job.status === "searching" || job.status === "scraping" || job.status === "done"
      )
    : [];

  // Sort: active jobs first, then completed
  activeJobs.sort((a, b) => {
    const aActive = a.status === "searching" || a.status === "scraping";
    const bActive = b.status === "searching" || b.status === "scraping";
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return 0;
  });

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Phone className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold text-white">DeepOutbound</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Active Jobs Section */}
      {activeJobs.length > 0 && (
        <div className="border-t border-gray-800 px-3 py-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Active Jobs
          </div>
          <div className="space-y-2">
            {activeJobs.map((job) => {
              if (job.type !== "lead-scraping") return null;

              const isSearching = job.status === "searching";
              const isScraping = job.status === "scraping";
              const isDone = job.status === "done";

              let progressPercent = 0;
              if (isSearching && job.searchQueriesTotal > 0) {
                progressPercent = (job.searchQueriesComplete / job.searchQueriesTotal) * 100;
              } else if (isScraping && job.sitesTotal > 0) {
                progressPercent = (job.sitesComplete / job.sitesTotal) * 100;
              } else if (isDone) {
                progressPercent = 100;
              }

              return (
                <button
                  key={job.id}
                  onClick={() => maximizeJob(job.id)}
                  className={`w-full text-left p-2 rounded-lg transition-colors group ${
                    isDone && job.totalLeadsAdded > 0
                      ? "bg-green-900/30 hover:bg-green-900/50 border border-green-800/50"
                      : "bg-gray-800/50 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {(isSearching || isScraping) && (
                      <Loader2 className="h-3 w-3 animate-spin text-blue-400 flex-shrink-0" />
                    )}
                    {isDone && (
                      <CheckCircle2 className={`h-3 w-3 flex-shrink-0 ${
                        job.totalLeadsAdded > 0 ? "text-green-400" : "text-gray-500"
                      }`} />
                    )}
                    <span className="text-xs text-gray-300 truncate flex-1">
                      {isDone && job.totalLeadsAdded > 0
                        ? `${job.totalLeadsAdded} leads added`
                        : job.domainName
                      }
                    </span>
                    <Maximize2 className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {!isDone && <Progress value={progressPercent} className="h-1" />}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-gray-500 truncate">
                      {isSearching && `Searching...`}
                      {isScraping && `${job.sitesComplete}/${job.sitesTotal} sites`}
                      {isDone && job.domainName}
                    </span>
                    {!isDone && job.totalLeadsAdded > 0 && (
                      <span className="text-[10px] text-green-400">
                        +{job.totalLeadsAdded}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-800 p-4">
        <div className="text-xs text-gray-500">
          Domain Sales Automation
        </div>
      </div>
    </div>
  );
}
