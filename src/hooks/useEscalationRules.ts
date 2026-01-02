"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { EscalationRule } from "@/types/database";

// Types for escalation rule configuration
export type TriggerType =
  | "no_response_days"
  | "high_engagement"
  | "reply_received"
  | "link_clicked"
  | "email_bounced";

export interface TriggerConfig {
  days?: number;
  engagement_threshold?: number;
  link_pattern?: string;
}

export interface RuleCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than";
  value: string | number;
}

export interface RuleAction {
  type: "notify_email" | "update_status" | "add_tag" | "pause_campaign";
  email?: string;
  status?: string;
  tag?: string;
}

export interface EscalationRuleFormData {
  name: string;
  description?: string;
  is_active: boolean;
  trigger_type: TriggerType;
  trigger_config: TriggerConfig;
  conditions: RuleCondition[];
  actions: RuleAction[];
  cooldown_hours: number;
}

export function useEscalationRules() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["escalation-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escalation_rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EscalationRule[];
    },
  });
}

export function useEscalationRule(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["escalation-rules", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escalation_rules")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as EscalationRule;
    },
    enabled: !!id,
  });
}

export function useCreateEscalationRule() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EscalationRuleFormData) => {
      const insertData = {
        name: data.name,
        description: data.description || null,
        is_active: data.is_active,
        trigger_type: data.trigger_type,
        trigger_config: JSON.parse(JSON.stringify(data.trigger_config)),
        conditions: JSON.parse(JSON.stringify(data.conditions)),
        actions: JSON.parse(JSON.stringify(data.actions)),
        cooldown_hours: data.cooldown_hours,
      };

      const { data: rule, error } = await supabase
        .from("escalation_rules")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return rule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
    },
  });
}

export function useUpdateEscalationRule() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: EscalationRuleFormData & { id: string }) => {
      const updateData = {
        name: data.name,
        description: data.description || null,
        is_active: data.is_active,
        trigger_type: data.trigger_type,
        trigger_config: JSON.parse(JSON.stringify(data.trigger_config)),
        conditions: JSON.parse(JSON.stringify(data.conditions)),
        actions: JSON.parse(JSON.stringify(data.actions)),
        cooldown_hours: data.cooldown_hours,
        updated_at: new Date().toISOString(),
      };

      const { data: rule, error } = await supabase
        .from("escalation_rules")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return rule;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
      queryClient.invalidateQueries({ queryKey: ["escalation-rules", variables.id] });
    },
  });
}

export function useToggleEscalationRule() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("escalation_rules")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
    },
  });
}

export function useDeleteEscalationRule() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("escalation_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
    },
  });
}

// Get recent escalation triggers from activity logs
export function useEscalationHistory(limit = 50) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["escalation-history", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          *,
          prospects (id, email, first_name, last_name, company_name)
        `)
        .eq("activity_type", "escalation_triggered")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}
