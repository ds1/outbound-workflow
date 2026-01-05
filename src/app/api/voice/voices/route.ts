import { NextResponse } from "next/server";
import { elevenLabsService } from "@/services/elevenlabs";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

    const voices = await elevenLabsService.getVoices();
    return NextResponse.json({ voices });
  } catch (error) {
    console.error("Get voices error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get voices" },
      { status: 500 }
    );
  }
}
