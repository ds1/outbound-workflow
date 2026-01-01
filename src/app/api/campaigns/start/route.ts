import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scheduleEmailJob, scheduleVoicemailJob, scheduleTask } from "@/lib/queue";
import type { Database } from "@/types/database";

// Server-side Supabase client
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createClient<Database>(url, serviceKey);
}

// Campaign step type
interface CampaignStep {
  step: number;
  type: "email" | "voicemail";
  template_id: string;
  delay_days: number;
  audio_url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { campaign_id } = await request.json();

    if (!campaign_id) {
      return NextResponse.json(
        { error: "campaign_id is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Get enrolled prospects
    const { data: enrollments, error: enrollError } = await supabase
      .from("campaign_prospects")
      .select("prospect_id")
      .eq("campaign_id", campaign_id)
      .in("status", ["enrolled", "in_progress"]);

    if (enrollError) {
      return NextResponse.json(
        { error: "Failed to get enrolled prospects" },
        { status: 500 }
      );
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json(
        { error: "No prospects enrolled in this campaign" },
        { status: 400 }
      );
    }

    const prospectIds = enrollments.map((e) => e.prospect_id);
    const steps = (campaign.steps as unknown as CampaignStep[]) || [];

    if (steps.length === 0) {
      return NextResponse.json(
        { error: "Campaign has no steps defined" },
        { status: 400 }
      );
    }

    // Schedule the first step immediately
    const firstStep = steps[0];

    if (firstStep.type === "email") {
      await scheduleEmailJob({
        type: "send_batch",
        campaign_id,
        prospect_ids: prospectIds,
        step_number: firstStep.step,
        template_id: firstStep.template_id,
      });
    } else if (firstStep.type === "voicemail") {
      await scheduleVoicemailJob({
        type: "send_batch",
        campaign_id,
        prospect_ids: prospectIds,
        step_number: firstStep.step,
        template_id: firstStep.template_id,
        audio_url: firstStep.audio_url || "",
      });
    }

    // Schedule subsequent steps with delays
    for (let i = 1; i < steps.length; i++) {
      const step = steps[i];
      const delayMs = step.delay_days * 24 * 60 * 60 * 1000; // Convert days to milliseconds

      // Schedule a task to process this step after the delay
      await scheduleTask(
        {
          type: "process_campaign_step",
          campaign_id,
          step_number: step.step,
        },
        { delay: delayMs }
      );
    }

    // Schedule recurring check for escalations
    await scheduleTask(
      { type: "check_escalations" },
      {
        repeat: { pattern: "0 */6 * * *" }, // Every 6 hours
      }
    );

    return NextResponse.json({
      success: true,
      message: "Campaign started",
      steps_scheduled: steps.length,
      prospects_count: prospectIds.length,
    });
  } catch (error) {
    console.error("Start campaign error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start campaign" },
      { status: 500 }
    );
  }
}
