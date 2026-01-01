import { NextRequest, NextResponse } from "next/server";
import { resendService, SendEmailRequest } from "@/services/resend";
import { logActivity } from "@/hooks/useActivityLogs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SendEmailRequest;

    // Validate required fields
    if (!body.to) {
      return NextResponse.json(
        { error: "to is required" },
        { status: 400 }
      );
    }

    if (!body.subject) {
      return NextResponse.json(
        { error: "subject is required" },
        { status: 400 }
      );
    }

    if (!body.html) {
      return NextResponse.json(
        { error: "html is required" },
        { status: 400 }
      );
    }

    const result = await resendService.sendEmail(body);

    // Log activity if successful
    if (result.success && body.prospect_id) {
      await logActivity("email_sent", {
        prospect_id: body.prospect_id,
        campaign_id: body.campaign_id,
        domain_id: body.domain_id,
        description: `Email sent: ${body.subject}`,
        metadata: { email_id: result.id },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
