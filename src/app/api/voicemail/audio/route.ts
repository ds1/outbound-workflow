import { NextResponse } from "next/server";
import { slybroadcastService } from "@/services/slybroadcast";
import { createClient } from "@/lib/supabase/server";

// GET - List available audio files in Slybroadcast account
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

    const audioFiles = await slybroadcastService.getAudioFiles();
    return NextResponse.json({ audio_files: audioFiles });
  } catch (error) {
    console.error("Get audio files error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get audio files" },
      { status: 500 }
    );
  }
}
