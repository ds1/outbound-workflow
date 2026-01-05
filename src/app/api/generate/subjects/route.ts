import { NextRequest, NextResponse } from "next/server";
import { claudeService, SubjectLineRequest } from "@/services/claude";
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

    const body = (await request.json()) as SubjectLineRequest;

    // Validate required fields
    if (!body.domain?.full_domain) {
      return NextResponse.json(
        { error: "domain.full_domain is required" },
        { status: 400 }
      );
    }

    const result = await claudeService.generateSubjectLines(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Subject line generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate subject lines" },
      { status: 500 }
    );
  }
}
