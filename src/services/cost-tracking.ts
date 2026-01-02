import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Service cost rates (estimated)
export const SERVICE_RATES = {
  resend: {
    email_sent: { unit_cost: 0.0009, unit: "email" }, // $0.90 per 1000
  },
  slybroadcast: {
    voicemail_sent: { unit_cost: 0.09, unit: "voicemail" }, // ~$90 per 1000
  },
  elevenlabs: {
    voice_generated: { unit_cost: 0.00003, unit: "character" }, // ~$0.03 per 1000 chars
  },
  claude: {
    content_generated: { unit_cost: 0.000015, unit: "token" }, // ~$15 per 1M tokens (output)
  },
};

interface CostLogParams {
  service: keyof typeof SERVICE_RATES;
  operation: string;
  quantity: number;
  campaign_id?: string;
  prospect_id?: string;
  metadata?: Record<string, unknown>;
}

class CostTrackingService {
  private getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      throw new Error("Supabase credentials not configured");
    }

    return createClient<Database>(url, serviceKey);
  }

  async logCost(params: CostLogParams): Promise<void> {
    const { service, operation, quantity, campaign_id, prospect_id, metadata } = params;

    const serviceRates = SERVICE_RATES[service];
    const operationRate = serviceRates?.[operation as keyof typeof serviceRates];

    if (!operationRate) {
      console.warn(`Unknown operation ${operation} for service ${service}`);
      return;
    }

    const { unit_cost, unit } = operationRate;
    const total_cost = quantity * unit_cost;

    try {
      const supabase = this.getSupabase();

      const insertData = {
        service,
        operation,
        quantity,
        unit,
        unit_cost,
        total_cost,
        campaign_id: campaign_id || null,
        prospect_id: prospect_id || null,
        metadata: JSON.parse(JSON.stringify(metadata || {})),
      };

      await supabase.from("cost_logs").insert(insertData);
    } catch (error) {
      console.error("Failed to log cost:", error);
      // Don't throw - cost logging should not break main functionality
    }
  }

  // Convenience methods for each service
  async logEmailSent(params: { campaign_id?: string; prospect_id?: string; metadata?: Record<string, unknown> }) {
    await this.logCost({
      service: "resend",
      operation: "email_sent",
      quantity: 1,
      ...params,
    });
  }

  async logVoicemailSent(params: { campaign_id?: string; prospect_id?: string; metadata?: Record<string, unknown> }) {
    await this.logCost({
      service: "slybroadcast",
      operation: "voicemail_sent",
      quantity: 1,
      ...params,
    });
  }

  async logVoiceGenerated(params: {
    characters: number;
    campaign_id?: string;
    prospect_id?: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.logCost({
      service: "elevenlabs",
      operation: "voice_generated",
      quantity: params.characters,
      campaign_id: params.campaign_id,
      prospect_id: params.prospect_id,
      metadata: params.metadata,
    });
  }

  async logAIGenerated(params: {
    tokens: number;
    campaign_id?: string;
    prospect_id?: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.logCost({
      service: "claude",
      operation: "content_generated",
      quantity: params.tokens,
      campaign_id: params.campaign_id,
      prospect_id: params.prospect_id,
      metadata: params.metadata,
    });
  }

  // Get cost summary for a period
  async getCostSummary(days: number = 30): Promise<{
    by_service: { service: string; total_operations: number; total_cost: number }[];
    total: number;
  }> {
    try {
      const supabase = this.getSupabase();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("cost_logs")
        .select("service, total_cost")
        .gte("created_at", startDate.toISOString());

      if (error) throw error;

      // Aggregate by service
      const serviceMap = new Map<string, { total_operations: number; total_cost: number }>();

      for (const log of data || []) {
        const existing = serviceMap.get(log.service) || { total_operations: 0, total_cost: 0 };
        existing.total_operations++;
        existing.total_cost += log.total_cost;
        serviceMap.set(log.service, existing);
      }

      const by_service = Array.from(serviceMap.entries()).map(([service, stats]) => ({
        service,
        ...stats,
      }));

      const total = by_service.reduce((sum, s) => sum + s.total_cost, 0);

      return { by_service, total };
    } catch (error) {
      console.error("Failed to get cost summary:", error);
      return { by_service: [], total: 0 };
    }
  }

  // Get costs for a specific campaign
  async getCampaignCosts(campaignId: string): Promise<{
    by_service: { service: string; total_cost: number }[];
    total: number;
  }> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from("cost_logs")
        .select("service, total_cost")
        .eq("campaign_id", campaignId);

      if (error) throw error;

      // Aggregate by service
      const serviceMap = new Map<string, number>();

      for (const log of data || []) {
        const existing = serviceMap.get(log.service) || 0;
        serviceMap.set(log.service, existing + log.total_cost);
      }

      const by_service = Array.from(serviceMap.entries()).map(([service, total_cost]) => ({
        service,
        total_cost,
      }));

      const total = by_service.reduce((sum, s) => sum + s.total_cost, 0);

      return { by_service, total };
    } catch (error) {
      console.error("Failed to get campaign costs:", error);
      return { by_service: [], total: 0 };
    }
  }
}

export const costTrackingService = new CostTrackingService();
