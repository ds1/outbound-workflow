import { Job } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import { resendService } from "@/services/resend";
import {
  scheduleEmailJob,
  scheduleVoicemailJob,
  type ScheduledTaskJobData,
} from "@/lib/queue";
import type { Database, Json } from "@/types/database";

// Create Supabase client with service role for worker
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createClient<Database>(url, serviceKey);
}

// Type for campaign steps
interface CampaignStep {
  step: number;
  type: "email" | "voicemail";
  template_id: string;
  delay_days: number;
  audio_url?: string;
}

export async function processScheduledTask(
  job: Job<ScheduledTaskJobData>
): Promise<{ success: boolean; message: string }> {
  const { type, campaign_id, step_number } = job.data;

  switch (type) {
    case "process_campaign_step":
      return processCampaignStep(campaign_id!, step_number!);
    case "check_escalations":
      return checkEscalations();
    case "cleanup_logs":
      return cleanupOldLogs();
    default:
      return { success: false, message: `Unknown task type: ${type}` };
  }
}

async function processCampaignStep(
  campaignId: string,
  stepNumber: number
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();

  try {
    // Get campaign with steps
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return { success: false, message: `Campaign not found: ${campaignId}` };
    }

    if (campaign.status !== "active") {
      return { success: true, message: "Campaign not active, skipping" };
    }

    // Parse steps from JSONB
    const steps = (campaign.steps as unknown as CampaignStep[]) || [];
    const currentStep = steps.find((s) => s.step === stepNumber);

    if (!currentStep) {
      return { success: false, message: `Step ${stepNumber} not found in campaign` };
    }

    // Get enrolled prospects who are ready for this step
    const { data: campaignProspects, error: prospectError } = await supabase
      .from("campaign_prospects")
      .select("prospect_id, current_step, enrolled_at")
      .eq("campaign_id", campaignId)
      .in("status", ["enrolled", "in_progress"])
      .lt("current_step", stepNumber);

    if (prospectError) {
      return { success: false, message: `Failed to get prospects: ${prospectError.message}` };
    }

    // Filter prospects who have waited long enough since their last step
    const now = new Date();
    const eligibleProspectIds: string[] = [];

    for (const cp of campaignProspects || []) {
      // Calculate when they should receive this step
      const previousStep = steps.find((s) => s.step === cp.current_step);
      const delayDays = currentStep.delay_days || 0;

      // For first step, use enrolled_at; otherwise use last activity
      const baseDate = cp.current_step === 0
        ? new Date(cp.enrolled_at!)
        : new Date(cp.enrolled_at!); // Would need last_activity_at from join

      const eligibleDate = new Date(baseDate);
      eligibleDate.setDate(eligibleDate.getDate() + delayDays);

      if (now >= eligibleDate) {
        eligibleProspectIds.push(cp.prospect_id);
      }
    }

    if (eligibleProspectIds.length === 0) {
      return { success: true, message: "No prospects ready for this step" };
    }

    // Schedule the appropriate job based on step type
    if (currentStep.type === "email") {
      await scheduleEmailJob({
        type: "send_batch",
        campaign_id: campaignId,
        prospect_ids: eligibleProspectIds,
        step_number: stepNumber,
        template_id: currentStep.template_id,
      });
    } else if (currentStep.type === "voicemail") {
      await scheduleVoicemailJob({
        type: "send_batch",
        campaign_id: campaignId,
        prospect_ids: eligibleProspectIds,
        step_number: stepNumber,
        template_id: currentStep.template_id,
        audio_url: currentStep.audio_url || "",
      });
    }

    return {
      success: true,
      message: `Scheduled ${currentStep.type} for ${eligibleProspectIds.length} prospects`,
    };
  } catch (err) {
    console.error("Process campaign step error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function checkEscalations(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();
  let escalationsTriggered = 0;

  try {
    // Get active escalation rules
    const { data: rules, error: rulesError } = await supabase
      .from("escalation_rules")
      .select("*")
      .eq("is_active", true);

    if (rulesError) {
      return { success: false, message: `Failed to get rules: ${rulesError.message}` };
    }

    for (const rule of rules || []) {
      const triggerConfig = rule.trigger_config as Record<string, unknown>;

      if (rule.trigger_type === "no_response_days") {
        // Find prospects with no activity for X days
        const days = (triggerConfig?.days as number) || 7;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const { data: prospects } = await supabase
          .from("campaign_prospects")
          .select(`
            prospect_id,
            campaign_id,
            prospects (email, first_name, last_name)
          `)
          .in("status", ["enrolled", "in_progress"])
          .lt("last_activity_at", cutoffDate.toISOString())
          .limit(50);

        for (const prospect of prospects || []) {
          await triggerEscalation(rule, prospect);
          escalationsTriggered++;
        }
      } else if (rule.trigger_type === "high_engagement") {
        // Find prospects with high engagement scores
        const threshold = (triggerConfig?.engagement_threshold as number) || 50;

        const { data: prospects } = await supabase
          .from("campaign_prospects")
          .select(`
            prospect_id,
            campaign_id,
            emails_opened,
            links_clicked,
            prospects (email, first_name, last_name)
          `)
          .in("status", ["enrolled", "in_progress"])
          .or(`emails_opened.gte.${threshold},links_clicked.gte.${Math.floor(threshold / 2)}`)
          .limit(50);

        for (const prospect of prospects || []) {
          await triggerEscalation(rule, prospect);
          escalationsTriggered++;
        }
      }
    }

    return {
      success: true,
      message: `Triggered ${escalationsTriggered} escalations`,
    };
  } catch (err) {
    console.error("Check escalations error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function triggerEscalation(
  rule: Database["public"]["Tables"]["escalation_rules"]["Row"],
  prospect: unknown
): Promise<void> {
  const actions = rule.actions as { type: string; email?: string }[];
  const notifyEmail = process.env.ESCALATION_NOTIFY_EMAIL;

  for (const action of actions || []) {
    if (action.type === "notify_email" && notifyEmail) {
      await resendService.sendEmail({
        to: { email: notifyEmail },
        subject: `[Escalation] ${rule.name}`,
        html: `
          <h2>Escalation Triggered: ${rule.name}</h2>
          <p><strong>Rule:</strong> ${rule.trigger_type}</p>
          <p><strong>Prospect:</strong> ${JSON.stringify(prospect)}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        `,
      });
    }
  }

  // Log the escalation
  const supabase = getSupabaseClient();
  await supabase.from("activity_logs").insert({
    activity_type: "escalation_triggered",
    description: `Escalation rule triggered: ${rule.name}`,
    metadata: JSON.parse(JSON.stringify({
      rule_id: rule.id,
      rule_name: rule.name,
      prospect,
    })),
  });
}

async function cleanupOldLogs(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();

  try {
    // Delete activity logs older than 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    // Count before delete
    const { count: beforeCount } = await supabase
      .from("activity_logs")
      .select("*", { count: "exact", head: true })
      .lt("created_at", cutoffDate.toISOString());

    // Delete old logs
    const { error } = await supabase
      .from("activity_logs")
      .delete()
      .lt("created_at", cutoffDate.toISOString());

    if (error) {
      return { success: false, message: `Cleanup failed: ${error.message}` };
    }

    return {
      success: true,
      message: `Cleaned up ${beforeCount || 0} old log entries`,
    };
  } catch (err) {
    console.error("Cleanup logs error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
