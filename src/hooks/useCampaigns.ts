"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Campaign, CampaignInsert, CampaignUpdate, Json } from "@/types/database";

const supabase = createClient();

// Campaign step type
export interface CampaignStep {
  step: number;
  type: "email" | "voicemail";
  template_id: string;
  delay_days: number;
  audio_url?: string;
}

// Schedule config type
export interface ScheduleConfig {
  timezone: string;
  send_days: string[]; // ['monday', 'tuesday', etc]
  start_hour: number;
  end_hour: number;
}

// List all campaigns
export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
  });
}

// Get single campaign
export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Campaign;
    },
    enabled: !!id,
  });
}

// Get campaign with enrolled prospects
export function useCampaignWithProspects(id: string) {
  return useQuery({
    queryKey: ["campaigns", id, "prospects"],
    queryFn: async () => {
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (campaignError) throw campaignError;

      const { data: enrollments, error: enrollError } = await supabase
        .from("campaign_prospects")
        .select(`
          *,
          prospects (*)
        `)
        .eq("campaign_id", id);

      if (enrollError) throw enrollError;

      return {
        campaign: campaign as Campaign,
        enrollments,
      };
    },
    enabled: !!id,
  });
}

// Get campaign stats
export function useCampaignStats() {
  return useQuery({
    queryKey: ["campaigns", "stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get active campaigns count
      const { count: activeCount } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get today's email count
      const { count: emailsToday } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("activity_type", "email_sent")
        .gte("created_at", today.toISOString());

      // Get today's voicemail count
      const { count: voicemailsToday } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("activity_type", "voicemail_sent")
        .gte("created_at", today.toISOString());

      return {
        activeCampaigns: activeCount || 0,
        emailsToday: emailsToday || 0,
        voicemailsToday: voicemailsToday || 0,
      };
    },
  });
}

// Create campaign
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: {
      name: string;
      description?: string;
      type: "email" | "voicemail" | "multi_channel";
      steps: CampaignStep[];
      schedule_config?: ScheduleConfig;
    }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          name: campaign.name,
          description: campaign.description,
          type: campaign.type,
          status: "draft",
          steps: campaign.steps as unknown as Json,
          schedule_config: campaign.schedule_config as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

// Update campaign
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: CampaignUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns", data.id] });
    },
  });
}

// Delete campaign
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

// Enroll prospects in campaign
export function useEnrollProspects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaign_id,
      prospect_ids,
    }: {
      campaign_id: string;
      prospect_ids: string[];
    }) => {
      const enrollments = prospect_ids.map((prospect_id) => ({
        campaign_id,
        prospect_id,
        status: "enrolled" as const,
        current_step: 0,
        enrolled_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("campaign_prospects")
        .upsert(enrollments, {
          onConflict: "campaign_id,prospect_id",
          ignoreDuplicates: true,
        })
        .select();

      if (error) throw error;

      // Update campaign total_enrolled count
      await supabase
        .from("campaigns")
        .update({ total_enrolled: prospect_ids.length })
        .eq("id", campaign_id);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns", variables.campaign_id] });
    },
  });
}

// Start campaign
export function useStartCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      // Update campaign status to active
      const { data, error } = await supabase
        .from("campaigns")
        .update({
          status: "active",
          started_at: new Date().toISOString(),
        })
        .eq("id", campaignId)
        .select()
        .single();

      if (error) throw error;

      // Trigger initial campaign processing via API
      const response = await fetch("/api/campaigns/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start campaign processing");
      }

      return data as Campaign;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns", data.id] });
    },
  });
}

// Pause campaign
export function usePauseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update({ status: "paused" })
        .eq("id", campaignId)
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns", data.id] });
    },
  });
}

// Resume campaign
export function useResumeCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update({ status: "active" })
        .eq("id", campaignId)
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns", data.id] });
    },
  });
}

// Complete campaign
export function useCompleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", campaignId)
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns", data.id] });
    },
  });
}
