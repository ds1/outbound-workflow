import { NextRequest, NextResponse } from "next/server";
import { claudeService, EmailGenerationRequest } from "@/services/claude";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EmailGenerationRequest;

    // Validate required fields
    if (!body.domain?.full_domain) {
      return NextResponse.json(
        { error: "domain.full_domain is required" },
        { status: 400 }
      );
    }

    if (!body.sender?.name || !body.sender?.email) {
      return NextResponse.json(
        { error: "sender.name and sender.email are required" },
        { status: 400 }
      );
    }

    const result = await claudeService.generateEmail(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Email generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate email" },
      { status: 500 }
    );
  }
}
