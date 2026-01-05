import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

// Verify webhook token (since Slybroadcast doesn't support signature verification)
function verifyWebhookToken(request: NextRequest): boolean {
  const webhookToken = process.env.SLYBROADCAST_WEBHOOK_TOKEN;

  // If no token configured, log warning but allow (for development)
  if (!webhookToken) {
    console.warn("SLYBROADCAST_WEBHOOK_TOKEN not configured - token verification disabled");
    return true;
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token || token !== webhookToken) {
    console.error("Invalid or missing webhook token");
    return false;
  }

  return true;
}

// Slybroadcast webhook (disposition callback) data
// Format: session_id, phone, status, timestamp
interface SlybroadcastWebhook {
  session_id: string;
  phone: string;
  status: "delivered" | "failed" | "busy" | "no_answer" | "invalid";
  timestamp?: string;
  carrier?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook token
    if (!verifyWebhookToken(request)) {
      return NextResponse.json(
        { error: "Invalid webhook token" },
        { status: 401 }
      );
    }

    // Slybroadcast sends form data
    const formData = await request.formData();

    const webhook: SlybroadcastWebhook = {
      session_id: formData.get("session_id") as string,
      phone: formData.get("phone") as string,
      status: formData.get("status") as SlybroadcastWebhook["status"],
      timestamp: formData.get("timestamp") as string | undefined,
      carrier: formData.get("carrier") as string | undefined,
    };

    if (!webhook.session_id || !webhook.phone || !webhook.status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Additional security: Verify the session_id exists in our activity logs
    // This ensures we only process callbacks for voicemails we actually sent
    const { data: existingActivity } = await supabase
      .from("activity_logs")
      .select("id")
      .eq("activity_type", "voicemail_sent")
      .like("metadata", `%"session_id":"${webhook.session_id}"%`)
      .limit(1)
      .single();

    if (!existingActivity) {
      console.warn(`Unknown session_id in webhook: ${webhook.session_id}`);
      // Return 200 to prevent retries, but don't process
      return NextResponse.json({ received: true, processed: false });
    }

    // Normalize phone number for lookup
    const normalizedPhone = webhook.phone.replace(/\D/g, "");
    const phoneVariants = [
      normalizedPhone,
      normalizedPhone.slice(-10), // Last 10 digits
      `1${normalizedPhone.slice(-10)}`, // With country code
    ];

    // Find the prospect by phone
    const { data: prospect } = await supabase
      .from("prospects")
      .select("id")
      .or(phoneVariants.map((p) => `phone.ilike.%${p}%`).join(","))
      .limit(1)
      .single();

    if (!prospect) {
      console.log(`Prospect not found for phone: ${webhook.phone}`);
      return NextResponse.json({ received: true });
    }

    // Find the activity log entry for this voicemail
    const { data: activityLog } = await supabase
      .from("activity_logs")
      .select("id, campaign_id, metadata")
      .eq("prospect_id", prospect.id)
      .eq("activity_type", "voicemail_sent")
      .like("metadata", `%"session_id":"${webhook.session_id}"%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const campaignId = activityLog?.campaign_id;

    // Handle different statuses
    switch (webhook.status) {
      case "delivered":
        await supabase.from("activity_logs").insert({
          prospect_id: prospect.id,
          campaign_id: campaignId,
          activity_type: "voicemail_delivered",
          description: `Voicemail delivered to ${webhook.phone}`,
          metadata: {
            session_id: webhook.session_id,
            carrier: webhook.carrier,
          },
        });

        // Note: voicemail delivery confirmation logged in activity_logs
        // campaign_prospects.voicemails_sent is updated when voicemail is sent, not delivered
        break;

      case "failed":
      case "invalid":
        await supabase.from("activity_logs").insert({
          prospect_id: prospect.id,
          campaign_id: campaignId,
          activity_type: "voicemail_failed",
          description: `Voicemail failed: ${webhook.status}`,
          metadata: {
            session_id: webhook.session_id,
            status: webhook.status,
          },
        });

        // Mark campaign prospect as failed if voicemail couldn't be delivered
        if (campaignId && webhook.status === "invalid") {
          await supabase
            .from("campaign_prospects")
            .update({ status: "removed" })
            .eq("campaign_id", campaignId)
            .eq("prospect_id", prospect.id);
        }
        break;

      case "busy":
      case "no_answer":
        await supabase.from("activity_logs").insert({
          prospect_id: prospect.id,
          campaign_id: campaignId,
          activity_type: "voicemail_pending",
          description: `Voicemail ${webhook.status}: will retry`,
          metadata: {
            session_id: webhook.session_id,
            status: webhook.status,
          },
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Voicemail webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
