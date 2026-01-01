import { NextResponse } from "next/server";
import { elevenLabsService } from "@/services/elevenlabs";

export async function GET() {
  try {
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
