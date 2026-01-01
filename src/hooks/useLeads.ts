"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Prospect, ProspectInsert, ProspectUpdate } from "@/types/database";

const supabase = createClient();

type ProspectStatus = "new" | "contacted" | "engaged" | "qualified" | "converted" | "unsubscribed";

export function useLeads(filters?: { status?: ProspectStatus; domainId?: string }) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: async () => {
      let query = supabase
        .from("prospects")
        .select("*, domains(full_domain)")
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.domainId) {
        query = query.eq("domain_id", filters.domainId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Prospect & { domains: { full_domain: string } | null })[];
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ["leads", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prospects")
        .select("*, domains(full_domain)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Prospect & { domains: { full_domain: string } | null };
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: ProspectInsert) => {
      const { data, error } = await supabase
        .from("prospects")
        .insert(lead)
        .select()
        .single();

      if (error) throw error;
      return data as Prospect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProspectUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("prospects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Prospect;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", data.id] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prospects").delete().eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useBulkCreateLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leads: ProspectInsert[]) => {
      const { data, error } = await supabase
        .from("prospects")
        .insert(leads)
        .select();

      if (error) throw error;
      return data as Prospect[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
