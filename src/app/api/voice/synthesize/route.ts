import { NextRequest, NextResponse } from "next/server";
import { elevenLabsService, TextToSpeechRequest } from "@/services/elevenlabs";
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

    const body = (await request.json()) as TextToSpeechRequest;

    // Validate required fields
    if (!body.text) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    if (!body.voice_id) {
      return NextResponse.json(
        { error: "voice_id is required" },
        { status: 400 }
      );
    }

    const result = await elevenLabsService.textToSpeech(body);

    // Return audio as base64
    return NextResponse.json({
      audio_base64: result.audio.toString("base64"),
      content_type: result.content_type,
      duration_seconds: result.duration_seconds,
    });
  } catch (error) {
    console.error("Voice synthesis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to synthesize voice" },
      { status: 500 }
    );
  }
}
