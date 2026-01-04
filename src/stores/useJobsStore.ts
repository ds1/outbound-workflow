import { create } from "zustand";

export type JobType = "lead-scraping";

export type JobStatus = "searching" | "scraping" | "done" | "error";

export interface ScrapeJobProgress {
  company: string;
  status: "pending" | "scraping" | "done" | "error";
  leadsAdded: number;
  error?: string;
}

export interface LeadScrapingJob {
  id: string;
  type: "lead-scraping";
  status: JobStatus;
  domainName: string;
  strategyName: string;
  // Search phase
  searchQueriesTotal: number;
  searchQueriesComplete: number;
  currentSearchQuery?: string;
  // Scrape phase
  sitesTotal: number;
  sitesComplete: number;
  currentSite?: string;
  progress: ScrapeJobProgress[];
  // Results
  totalLeadsAdded: number;
  leadsWithPhone: number;
  // Timestamps
  startedAt: Date;
  completedAt?: Date;
}

export type Job = LeadScrapingJob;

interface JobsState {
  jobs: Map<string, Job>;
  minimizedJobs: Set<string>;

  // Actions
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  removeJob: (id: string) => void;
  minimizeJob: (id: string) => void;
  maximizeJob: (id: string) => void;
  getJob: (id: string) => Job | undefined;
  getActiveJobs: () => Job[];
  isJobMinimized: (id: string) => boolean;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: new Map(),
  minimizedJobs: new Set(),

  addJob: (job) =>
    set((state) => {
      const newJobs = new Map(state.jobs);
      newJobs.set(job.id, job);
      return { jobs: newJobs };
    }),

  updateJob: (id, updates) =>
    set((state) => {
      const newJobs = new Map(state.jobs);
      const existing = newJobs.get(id);
      if (existing) {
        newJobs.set(id, { ...existing, ...updates } as Job);
      }
      return { jobs: newJobs };
    }),

  removeJob: (id) =>
    set((state) => {
      const newJobs = new Map(state.jobs);
      newJobs.delete(id);
      const newMinimized = new Set(state.minimizedJobs);
      newMinimized.delete(id);
      return { jobs: newJobs, minimizedJobs: newMinimized };
    }),

  minimizeJob: (id) =>
    set((state) => {
      const newMinimized = new Set(state.minimizedJobs);
      newMinimized.add(id);
      return { minimizedJobs: newMinimized };
    }),

  maximizeJob: (id) =>
    set((state) => {
      const newMinimized = new Set(state.minimizedJobs);
      newMinimized.delete(id);
      return { minimizedJobs: newMinimized };
    }),

  getJob: (id) => get().jobs.get(id),

  getActiveJobs: () => {
    const jobs = Array.from(get().jobs.values());
    return jobs.filter((j) => j.status !== "done" && j.status !== "error");
  },

  isJobMinimized: (id) => get().minimizedJobs.has(id),
}));
