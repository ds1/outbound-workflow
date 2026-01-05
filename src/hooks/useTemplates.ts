"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { EmailTemplate, VoicemailTemplate, Json } from "@/types/database";

const supabase = createClient();

// Email Templates
export function useEmailTemplates() {
  return useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EmailTemplate[];
    },
  });
}

export function useEmailTemplate(id: string) {
  return useQuery({
    queryKey: ["email-templates", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as EmailTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: {
      name: string;
      subject: string;
      body_html: string;
      body_text?: string;
      preview_text?: string;
      variables?: Json;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("email_templates")
        .insert({ ...template, created_by: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as EmailTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      name?: string;
      subject?: string;
      body_html?: string;
      body_text?: string;
      preview_text?: string;
      variables?: Json;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("email_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as EmailTemplate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      queryClient.invalidateQueries({ queryKey: ["email-templates", data.id] });
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("email_templates").delete().eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
}

// Voicemail Templates
export function useVoicemailTemplates() {
  return useQuery({
    queryKey: ["voicemail-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voicemail_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VoicemailTemplate[];
    },
  });
}

export function useVoicemailTemplate(id: string) {
  return useQuery({
    queryKey: ["voicemail-templates", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voicemail_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as VoicemailTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateVoicemailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: {
      name: string;
      script: string;
      audio_file_path?: string;
      audio_duration_seconds?: number;
      variables?: Json;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("voicemail_templates")
        .insert({ ...template, created_by: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as VoicemailTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voicemail-templates"] });
    },
  });
}

export function useUpdateVoicemailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      name?: string;
      script?: string;
      audio_file_path?: string;
      audio_duration_seconds?: number;
      variables?: Json;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("voicemail_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as VoicemailTemplate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["voicemail-templates"] });
      queryClient.invalidateQueries({ queryKey: ["voicemail-templates", data.id] });
    },
  });
}

export function useDeleteVoicemailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("voicemail_templates").delete().eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voicemail-templates"] });
    },
  });
}
