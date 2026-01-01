"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Domain, DomainInsert, DomainUpdate } from "@/types/database";

const supabase = createClient();

export function useDomains() {
  return useQuery({
    queryKey: ["domains"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Domain[];
    },
  });
}

export function useDomain(id: string) {
  return useQuery({
    queryKey: ["domains", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Domain;
    },
    enabled: !!id,
  });
}

export function useCreateDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domain: DomainInsert) => {
      const { data, error } = await supabase
        .from("domains")
        .insert(domain)
        .select()
        .single();

      if (error) throw error;
      return data as Domain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
    },
  });
}

export function useUpdateDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: DomainUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("domains")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Domain;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      queryClient.invalidateQueries({ queryKey: ["domains", data.id] });
    },
  });
}

export function useDeleteDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("domains").delete().eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
    },
  });
}
