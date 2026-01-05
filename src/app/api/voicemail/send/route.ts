import { NextRequest, NextResponse } from "next/server";
import { slybroadcastService } from "@/services/slybroadcast";
import { logActivity } from "@/hooks/useActivityLogs";
import { createClient } from "@/lib/supabase/server";

export interface SendVoicemailRequest {
  phone_number: string;
  audio_url: string;
  prospect_id?: string;
  campaign_id?: string;
  domain_id?: string;
  campaign_name?: string;
  webhook_url?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as SendVoicemailRequest;

    // Validate required fields
    if (!body.phone_number) {
      return NextResponse.json(
        { error: "phone_number is required" },
        { status: 400 }
      );
    }

    if (!body.audio_url) {
      return NextResponse.json(
        { error: "audio_url is required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!slybroadcastService.isValidUSPhone(body.phone_number)) {
      return NextResponse.json(
        { error: "Invalid US phone number format" },
        { status: 400 }
      );
    }

    const result = await slybroadcastService.sendVoicemail(
      body.phone_number,
      body.audio_url,
      {
        campaign_name: body.campaign_name,
        webhook_url: body.webhook_url,
      }
    );

    // Log activity if successful
    if (result.success && body.prospect_id) {
      await logActivity("voicemail_sent", {
        prospect_id: body.prospect_id,
        campaign_id: body.campaign_id,
        domain_id: body.domain_id,
        description: `Voicemail sent to ${body.phone_number}`,
        metadata: { session_id: result.session_id },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Voicemail send error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send voicemail" },
      { status: 500 }
    );
  }
}
