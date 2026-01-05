import { NextRequest, NextResponse } from "next/server";
import { claudeService, VoicemailGenerationRequest } from "@/services/claude";
import { createClient } from "@/lib/supabase/server";

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

    const body = (await request.json()) as VoicemailGenerationRequest;

    // Validate required fields
    if (!body.domain?.full_domain) {
      return NextResponse.json(
        { error: "domain.full_domain is required" },
        { status: 400 }
      );
    }

    if (!body.sender?.name) {
      return NextResponse.json(
        { error: "sender.name is required" },
        { status: 400 }
      );
    }

    const result = await claudeService.generateVoicemailScript(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Voicemail generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate voicemail script" },
      { status: 500 }
    );
  }
}
