import { Job } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import { resendService } from "@/services/resend";
import { claudeService } from "@/services/claude";
import type { EmailCampaignJobData } from "@/lib/queue";
import type { Database } from "@/types/database";

// Create Supabase client with service role for worker
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createClient<Database>(url, serviceKey);
}

export async function processEmailCampaignJob(
  job: Job<EmailCampaignJobData>
): Promise<{ success: boolean; sent: number; failed: number }> {
  const { campaign_id, prospect_ids, step_number, template_id } = job.data;
  const supabase = getSupabaseClient();

  let sent = 0;
  let failed = 0;

  try {
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaign_id)
      .single();

    if (campaignError || !campaign) {
      throw new Error(`Campaign not found: ${campaign_id}`);
    }

    // Check if campaign is still active
    if (campaign.status !== "active") {
      console.log(`Campaign ${campaign_id} is not active, skipping`);
      return { success: true, sent: 0, failed: 0 };
    }

    // Get template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", template_id)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${template_id}`);
    }

    // Get prospects with their domain info
    const { data: prospects, error: prospectsError } = await supabase
      .from("prospects")
      .select(`
        *,
        domains (*)
      `)
      .in("id", prospect_ids)
      .eq("do_not_contact", false);

    if (prospectsError) {
      throw new Error(`Failed to fetch prospects: ${prospectsError.message}`);
    }

    // Process each prospect
    for (const prospect of prospects || []) {
      try {
        // Update job progress
        await job.updateProgress({
          current: sent + failed,
          total: prospect_ids.length,
          currentProspect: prospect.email,
        });

        // Check if prospect already received this step
        const { data: existingActivity } = await supabase
          .from("activity_logs")
          .select("id")
          .eq("prospect_id", prospect.id)
          .eq("campaign_id", campaign_id)
          .eq("activity_type", "email_sent")
          .like("metadata", `%"step":${step_number}%`)
          .limit(1);

        if (existingActivity && existingActivity.length > 0) {
          console.log(`Prospect ${prospect.id} already received step ${step_number}`);
          continue;
        }

        // Generate personalized content if template has placeholders
        let subject = template.subject || "";
        let bodyHtml = template.body_html || "";

        // Replace template variables
        const domain = prospect.domains as Database["public"]["Tables"]["domains"]["Row"] | null;

        const variables: Record<string, string> = {
          "{{lead.first_name}}": prospect.first_name || "",
          "{{lead.last_name}}": prospect.last_name || "",
          "{{lead.company}}": prospect.company_name || "",
          "{{lead.email}}": prospect.email || "",
          "{{domain.name}}": domain?.name || "",
          "{{domain.full}}": domain?.full_domain || "",
          "{{domain.price}}": domain?.buy_now_price?.toString() || "",
          "{{domain.url}}": domain?.landing_page_url || "",
        };

        for (const [key, value] of Object.entries(variables)) {
          subject = subject.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value);
          bodyHtml = bodyHtml.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value);
        }

        // Send email
        const result = await resendService.sendEmail({
          to: { email: prospect.email! },
          subject,
          html: bodyHtml,
          prospect_id: prospect.id,
          campaign_id,
          domain_id: prospect.domain_id || undefined,
        });

        if (result.success) {
          sent++;

          // Log activity
          await supabase.from("activity_logs").insert({
            prospect_id: prospect.id,
            campaign_id,
            domain_id: prospect.domain_id,
            activity_type: "email_sent",
            description: `Email sent: ${subject}`,
            metadata: {
              step: step_number,
              template_id,
              email_id: result.id,
            },
          });

          // Update campaign_prospects status
          const { data: enrollment } = await supabase
            .from("campaign_prospects")
            .select("emails_sent")
            .eq("campaign_id", campaign_id)
            .eq("prospect_id", prospect.id)
            .single();

          await supabase
            .from("campaign_prospects")
            .update({
              current_step: step_number,
              emails_sent: (enrollment?.emails_sent || 0) + 1,
            })
            .eq("campaign_id", campaign_id)
            .eq("prospect_id", prospect.id);
        } else {
          failed++;
          console.error(`Failed to send email to ${prospect.email}:`, result.error);
        }

        // Rate limiting: wait between sends
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        failed++;
        console.error(`Error processing prospect ${prospect.id}:`, err);
      }
    }

    // Update campaign stats
    const { data: currentCampaign } = await supabase
      .from("campaigns")
      .select("total_sent")
      .eq("id", campaign_id)
      .single();

    await supabase
      .from("campaigns")
      .update({
        total_sent: (currentCampaign?.total_sent || 0) + sent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaign_id);

    return { success: true, sent, failed };
  } catch (err) {
    console.error("Email campaign job failed:", err);
    throw err;
  }
}
