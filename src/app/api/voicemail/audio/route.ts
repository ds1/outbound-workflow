import { NextResponse } from "next/server";
import { slybroadcastService } from "@/services/slybroadcast";

// GET - List available audio files in Slybroadcast account
export async function GET() {
  try {
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
