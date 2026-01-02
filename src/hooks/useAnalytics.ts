"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { subDays, format, startOfDay, endOfDay } from "date-fns";

export interface CampaignStats {
  id: string;
  name: string;
  type: string;
  status: string;
  total_enrolled: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_replied: number;
  total_converted: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
  conversion_rate: number;
}

export interface DailyActivity {
  date: string;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  voicemails_sent: number;
}

export interface EngagementMetrics {
  total_prospects: number;
  engaged_prospects: number;
  converted_prospects: number;
  unsubscribed_prospects: number;
  engagement_rate: number;
  conversion_rate: number;
}

export interface CostEstimate {
  service: string;
  usage: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
}

// Get campaign performance stats
export function useCampaignAnalytics() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["analytics", "campaigns"],
    queryFn: async () => {
      const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const stats: CampaignStats[] = (campaigns || []).map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
        total_enrolled: c.total_enrolled || 0,
        total_sent: c.total_sent || 0,
        total_opened: c.total_opened || 0,
        total_clicked: c.total_clicked || 0,
        total_replied: c.total_replied || 0,
        total_converted: c.total_converted || 0,
        open_rate: c.total_sent > 0 ? ((c.total_opened || 0) / c.total_sent) * 100 : 0,
        click_rate: c.total_opened > 0 ? ((c.total_clicked || 0) / c.total_opened) * 100 : 0,
        reply_rate: c.total_sent > 0 ? ((c.total_replied || 0) / c.total_sent) * 100 : 0,
        conversion_rate: c.total_enrolled > 0 ? ((c.total_converted || 0) / c.total_enrolled) * 100 : 0,
      }));

      return stats;
    },
  });
}

// Get daily activity for the last N days
export function useDailyActivity(days: number = 30) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["analytics", "daily-activity", days],
    queryFn: async () => {
      const startDate = subDays(new Date(), days);

      const { data: logs, error } = await supabase
        .from("activity_logs")
        .select("activity_type, created_at")
        .in("activity_type", ["email_sent", "email_opened", "email_clicked", "voicemail_sent"])
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by date
      const dailyMap = new Map<string, DailyActivity>();

      // Initialize all days
      for (let i = days; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        dailyMap.set(date, {
          date,
          emails_sent: 0,
          emails_opened: 0,
          emails_clicked: 0,
          voicemails_sent: 0,
        });
      }

      // Aggregate logs
      for (const log of logs || []) {
        const date = format(new Date(log.created_at), "yyyy-MM-dd");
        const existing = dailyMap.get(date);
        if (existing) {
          switch (log.activity_type) {
            case "email_sent":
              existing.emails_sent++;
              break;
            case "email_opened":
              existing.emails_opened++;
              break;
            case "email_clicked":
              existing.emails_clicked++;
              break;
            case "voicemail_sent":
              existing.voicemails_sent++;
              break;
          }
        }
      }

      return Array.from(dailyMap.values());
    },
  });
}

// Get overall engagement metrics
export function useEngagementMetrics() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["analytics", "engagement"],
    queryFn: async () => {
      const { data: prospects, error } = await supabase
        .from("prospects")
        .select("status");

      if (error) throw error;

      const total = prospects?.length || 0;
      const engaged = prospects?.filter((p) =>
        ["contacted", "engaged", "qualified", "converted"].includes(p.status)
      ).length || 0;
      const converted = prospects?.filter((p) => p.status === "converted").length || 0;
      const unsubscribed = prospects?.filter((p) => p.status === "unsubscribed").length || 0;

      const metrics: EngagementMetrics = {
        total_prospects: total,
        engaged_prospects: engaged,
        converted_prospects: converted,
        unsubscribed_prospects: unsubscribed,
        engagement_rate: total > 0 ? (engaged / total) * 100 : 0,
        conversion_rate: total > 0 ? (converted / total) * 100 : 0,
      };

      return metrics;
    },
  });
}

// Get cost estimates based on activity
export function useCostEstimates(days: number = 30) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["analytics", "costs", days],
    queryFn: async () => {
      const startDate = subDays(new Date(), days);

      // Count activities by type
      const { data: logs, error } = await supabase
        .from("activity_logs")
        .select("activity_type")
        .in("activity_type", ["email_sent", "voicemail_sent", "ai_content_generated"])
        .gte("created_at", startDate.toISOString());

      if (error) throw error;

      const counts = {
        emails: 0,
        voicemails: 0,
        ai_generations: 0,
      };

      for (const log of logs || []) {
        switch (log.activity_type) {
          case "email_sent":
            counts.emails++;
            break;
          case "voicemail_sent":
            counts.voicemails++;
            break;
          case "ai_content_generated":
            counts.ai_generations++;
            break;
        }
      }

      // Estimated costs per service
      const costs: CostEstimate[] = [
        {
          service: "Resend (Email)",
          usage: counts.emails,
          unit: "emails",
          unit_cost: 0.0009, // $0.90 per 1000
          total_cost: counts.emails * 0.0009,
        },
        {
          service: "Slybroadcast (Voicemail)",
          usage: counts.voicemails,
          unit: "voicemails",
          unit_cost: 0.09, // ~$90 per 1000
          total_cost: counts.voicemails * 0.09,
        },
        {
          service: "ElevenLabs (Voice)",
          usage: counts.voicemails,
          unit: "generations",
          unit_cost: 0.016, // ~$16 per 1000
          total_cost: counts.voicemails * 0.016,
        },
        {
          service: "Claude API (AI)",
          usage: counts.ai_generations || Math.ceil(counts.emails / 5), // Estimate if not tracked
          unit: "requests",
          unit_cost: 0.02, // ~$20 per 1000 (rough estimate)
          total_cost: (counts.ai_generations || Math.ceil(counts.emails / 5)) * 0.02,
        },
      ];

      return {
        costs,
        total: costs.reduce((sum, c) => sum + c.total_cost, 0),
        period_days: days,
      };
    },
  });
}

// Get activity totals for dashboard
export function useActivityTotals() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["analytics", "totals"],
    queryFn: async () => {
      // Get counts for various activity types
      const activityTypes = [
        "email_sent",
        "email_opened",
        "email_clicked",
        "email_bounced",
        "voicemail_sent",
        "voicemail_delivered",
      ];

      const results: Record<string, number> = {};

      for (const type of activityTypes) {
        const { count } = await supabase
          .from("activity_logs")
          .select("*", { count: "exact", head: true })
          .eq("activity_type", type);

        results[type] = count || 0;
      }

      return {
        emails_sent: results.email_sent || 0,
        emails_opened: results.email_opened || 0,
        emails_clicked: results.email_clicked || 0,
        emails_bounced: results.email_bounced || 0,
        voicemails_sent: results.voicemail_sent || 0,
        voicemails_delivered: results.voicemail_delivered || 0,
        open_rate: results.email_sent > 0
          ? (results.email_opened / results.email_sent) * 100
          : 0,
        click_rate: results.email_opened > 0
          ? (results.email_clicked / results.email_opened) * 100
          : 0,
        bounce_rate: results.email_sent > 0
          ? (results.email_bounced / results.email_sent) * 100
          : 0,
      };
    },
  });
}
