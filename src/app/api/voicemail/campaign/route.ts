import { NextRequest, NextResponse } from "next/server";
import { slybroadcastService, CampaignAction } from "@/services/slybroadcast";

export interface BulkVoicemailRequest {
  phone_numbers: string[];
  audio_url: string;
  campaign_name?: string;
  scheduled_time?: string; // ISO date string
  mobile_only?: boolean;
  webhook_url?: string;
}

export interface CampaignControlRequest {
  session_id: string;
  action: CampaignAction;
}

// POST - Create bulk voicemail campaign
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BulkVoicemailRequest;

    // Validate required fields
    if (!body.phone_numbers || body.phone_numbers.length === 0) {
      return NextResponse.json(
        { error: "phone_numbers array is required" },
        { status: 400 }
      );
    }

    if (!body.audio_url) {
      return NextResponse.json(
        { error: "audio_url is required" },
        { status: 400 }
      );
    }

    // Filter to valid phone numbers
    const validPhones = slybroadcastService.filterValidPhones(body.phone_numbers);
    const invalidCount = body.phone_numbers.length - validPhones.length;

    if (validPhones.length === 0) {
      return NextResponse.json(
        { error: "No valid phone numbers provided" },
        { status: 400 }
      );
    }

    // Parse scheduled time if provided
    const scheduledTime = body.scheduled_time
      ? new Date(body.scheduled_time)
      : undefined;

    const result = await slybroadcastService.sendBulkVoicemails(
      validPhones,
      body.audio_url,
      {
        campaign_name: body.campaign_name,
        scheduled_time: scheduledTime,
        mobile_only: body.mobile_only,
        webhook_url: body.webhook_url,
      }
    );

    // Include info about filtered numbers
    return NextResponse.json({
      ...result,
      valid_phone_count: validPhones.length,
      invalid_phone_count: invalidCount,
      estimated_cost: slybroadcastService.estimateCost(validPhones.length),
    });
  } catch (error) {
    console.error("Bulk voicemail error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create voicemail campaign" },
      { status: 500 }
    );
  }
}

// PATCH - Control existing campaign (pause, run, stop, cancel)
export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as CampaignControlRequest;

    // Validate required fields
    if (!body.session_id) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    if (!body.action) {
      return NextResponse.json(
        { error: "action is required (pause, run, stop, cancel)" },
        { status: 400 }
      );
    }

    const validActions: CampaignAction[] = ["pause", "run", "stop", "cancel"];
    if (!validActions.includes(body.action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be: pause, run, stop, or cancel" },
        { status: 400 }
      );
    }

    const result = await slybroadcastService.controlCampaign(
      body.session_id,
      body.action
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Campaign control error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to control campaign" },
      { status: 500 }
    );
  }
}
