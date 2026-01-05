import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Webhook } from "svix";
import type { Database } from "@/types/database";

// Server-side Supabase client
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createClient<Database>(url, serviceKey);
}

// Verify Resend webhook signature using Svix
async function verifyWebhookSignature(request: NextRequest): Promise<{ verified: boolean; payload?: ResendWebhookEvent; error?: string }> {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  // If no secret configured, log warning but allow (for development)
  if (!webhookSecret) {
    console.warn("RESEND_WEBHOOK_SECRET not configured - webhook signature verification disabled");
    const payload = await request.json();
    return { verified: true, payload };
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return { verified: false, error: "Missing Svix headers" };
  }

  const body = await request.text();

  try {
    const wh = new Webhook(webhookSecret);
    const payload = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ResendWebhookEvent;

    return { verified: true, payload };
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return { verified: false, error: "Invalid signature" };
  }
}

// Resend webhook event types
type ResendWebhookEvent = {
  type:
    | "email.sent"
    | "email.delivered"
    | "email.delivery_delayed"
    | "email.complained"
    | "email.bounced"
    | "email.opened"
    | "email.clicked";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    click?: {
      link: string;
      timestamp: string;
    };
  };
};

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const { verified, payload: event, error } = await verifyWebhookSignature(request);

    if (!verified || !event) {
      console.error("Webhook verification failed:", error);
      return NextResponse.json(
        { error: error || "Webhook verification failed" },
        { status: 401 }
      );
    }

    const supabase = getSupabase();

    const emailId = event.data.email_id;
    const recipientEmail = event.data.to[0];

    // Find the prospect and activity log
    const { data: prospect } = await supabase
      .from("prospects")
      .select("id")
      .eq("email", recipientEmail)
      .single();

    if (!prospect) {
      console.log(`Prospect not found for email: ${recipientEmail}`);
      return NextResponse.json({ received: true });
    }

    // Find the activity log entry for this email
    const { data: activityLog } = await supabase
      .from("activity_logs")
      .select("id, campaign_id, metadata")
      .eq("prospect_id", prospect.id)
      .eq("activity_type", "email_sent")
      .like("metadata", `%"email_id":"${emailId}"%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const campaignId = activityLog?.campaign_id;

    // Handle different event types
    switch (event.type) {
      case "email.delivered":
        await supabase.from("activity_logs").insert({
          prospect_id: prospect.id,
          campaign_id: campaignId,
          activity_type: "email_delivered",
          description: `Email delivered: ${event.data.subject}`,
          metadata: { email_id: emailId },
        });
        break;

      case "email.opened":
        await supabase.from("activity_logs").insert({
          prospect_id: prospect.id,
          campaign_id: campaignId,
          activity_type: "email_opened",
          description: `Email opened: ${event.data.subject}`,
          metadata: { email_id: emailId },
        });

        // Update campaign stats
        if (campaignId) {
          // Get current stats and increment
          const { data: currentCampaign } = await supabase
            .from("campaigns")
            .select("total_opened")
            .eq("id", campaignId)
            .single();

          await supabase
            .from("campaigns")
            .update({ total_opened: (currentCampaign?.total_opened || 0) + 1 })
            .eq("id", campaignId);

          // Update campaign_prospects
          const { data: currentEnrollment } = await supabase
            .from("campaign_prospects")
            .select("emails_opened")
            .eq("campaign_id", campaignId)
            .eq("prospect_id", prospect.id)
            .single();

          await supabase
            .from("campaign_prospects")
            .update({
              emails_opened: (currentEnrollment?.emails_opened || 0) + 1,
            })
            .eq("campaign_id", campaignId)
            .eq("prospect_id", prospect.id);
        }
        break;

      case "email.clicked":
        await supabase.from("activity_logs").insert({
          prospect_id: prospect.id,
          campaign_id: campaignId,
          activity_type: "email_clicked",
          description: `Link clicked: ${event.data.click?.link}`,
          metadata: {
            email_id: emailId,
            link: event.data.click?.link,
          },
        });

        // Update campaign stats
        if (campaignId) {
          // Get current stats and increment
          const { data: currentCampaign } = await supabase
            .from("campaigns")
            .select("total_clicked")
            .eq("id", campaignId)
            .single();

          await supabase
            .from("campaigns")
            .update({ total_clicked: (currentCampaign?.total_clicked || 0) + 1 })
            .eq("id", campaignId);

          // Update campaign_prospects
          const { data: currentEnrollment } = await supabase
            .from("campaign_prospects")
            .select("emails_clicked")
            .eq("campaign_id", campaignId)
            .eq("prospect_id", prospect.id)
            .single();

          await supabase
            .from("campaign_prospects")
            .update({
              emails_clicked: (currentEnrollment?.emails_clicked || 0) + 1,
            })
            .eq("campaign_id", campaignId)
            .eq("prospect_id", prospect.id);
        }
        break;

      case "email.bounced":
        await supabase.from("activity_logs").insert({
          prospect_id: prospect.id,
          campaign_id: campaignId,
          activity_type: "email_bounced",
          description: `Email bounced: ${event.data.subject}`,
          metadata: { email_id: emailId },
        });

        // Mark prospect as do_not_contact if email bounced
        await supabase
          .from("prospects")
          .update({ do_not_contact: true })
          .eq("id", prospect.id);

        // Update campaign_prospects status
        if (campaignId) {
          await supabase
            .from("campaign_prospects")
            .update({ status: "removed" })
            .eq("campaign_id", campaignId)
            .eq("prospect_id", prospect.id);
        }
        break;

      case "email.complained":
        await supabase.from("activity_logs").insert({
          prospect_id: prospect.id,
          campaign_id: campaignId,
          activity_type: "email_complained",
          description: `Spam complaint received`,
          metadata: { email_id: emailId },
        });

        // Mark prospect as do_not_contact
        await supabase
          .from("prospects")
          .update({
            do_not_contact: true,
            status: "unsubscribed",
          })
          .eq("id", prospect.id);

        // Update campaign_prospects status
        if (campaignId) {
          await supabase
            .from("campaign_prospects")
            .update({ status: "unsubscribed" })
            .eq("campaign_id", campaignId)
            .eq("prospect_id", prospect.id);
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Email webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
