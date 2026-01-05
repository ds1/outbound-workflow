"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ActivityLog, ActivityLogInsert, Json } from "@/types/database";

const supabase = createClient();

export function useActivityLogs(filters?: {
  prospectId?: string;
  campaignId?: string;
  domainId?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["activity-logs", filters],
    queryFn: async () => {
      let query = supabase
        .from("activity_logs")
        .select("*, prospects(email, first_name, last_name), campaigns(name), domains(full_domain)")
        .order("created_at", { ascending: false });

      if (filters?.prospectId) {
        query = query.eq("prospect_id", filters.prospectId);
      }
      if (filters?.campaignId) {
        query = query.eq("campaign_id", filters.campaignId);
      }
      if (filters?.domainId) {
        query = query.eq("domain_id", filters.domainId);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (ActivityLog & {
        prospects: { email: string | null; first_name: string | null; last_name: string | null } | null;
        campaigns: { name: string } | null;
        domains: { full_domain: string } | null;
      })[];
    },
  });
}

export function useRecentActivityLogs(limit: number = 10) {
  return useQuery({
    queryKey: ["activity-logs", "recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*, prospects(email, first_name, last_name), campaigns(name), domains(full_domain)")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as (ActivityLog & {
        prospects: { email: string | null; first_name: string | null; last_name: string | null } | null;
        campaigns: { name: string } | null;
        domains: { full_domain: string } | null;
      })[];
    },
  });
}

export function useCreateActivityLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: ActivityLogInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("activity_logs")
        .insert({ ...log, created_by: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as ActivityLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
  });
}

// Helper function to log activities (can be used throughout the app)
export async function logActivity(
  activity_type: string,
  options?: {
    prospect_id?: string;
    campaign_id?: string;
    domain_id?: string;
    description?: string;
    metadata?: Json;
  }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("Failed to log activity: Not authenticated");
    return;
  }

  const { error } = await supabase.from("activity_logs").insert({
    activity_type,
    prospect_id: options?.prospect_id,
    campaign_id: options?.campaign_id,
    domain_id: options?.domain_id,
    description: options?.description,
    metadata: options?.metadata || {},
    created_by: user.id,
  });

  if (error) {
    console.error("Failed to log activity:", error);
  }
}
