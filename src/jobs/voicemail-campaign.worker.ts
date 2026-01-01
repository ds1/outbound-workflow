import { Job } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import { slybroadcastService } from "@/services/slybroadcast";
import { elevenLabsService } from "@/services/elevenlabs";
import { claudeService } from "@/services/claude";
import type { VoicemailCampaignJobData } from "@/lib/queue";
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

export async function processVoicemailCampaignJob(
  job: Job<VoicemailCampaignJobData>
): Promise<{ success: boolean; sent: number; failed: number }> {
  const { campaign_id, prospect_ids, step_number, template_id, audio_url } = job.data;
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
      .from("voicemail_templates")
      .select("*")
      .eq("id", template_id)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${template_id}`);
    }

    // Get prospects with their phone numbers
    const { data: prospects, error: prospectsError } = await supabase
      .from("prospects")
      .select(`
        *,
        domains (*)
      `)
      .in("id", prospect_ids)
      .eq("do_not_contact", false)
      .not("phone", "is", null);

    if (prospectsError) {
      throw new Error(`Failed to fetch prospects: ${prospectsError.message}`);
    }

    // Filter to valid phone numbers
    const validProspects = (prospects || []).filter((p) =>
      p.phone && slybroadcastService.isValidUSPhone(p.phone)
    );

    if (validProspects.length === 0) {
      console.log("No valid phone numbers found");
      return { success: true, sent: 0, failed: 0 };
    }

    // Determine audio source
    let finalAudioUrl = audio_url;

    // If no audio URL but template has a script, we might need to generate audio
    // For now, we assume audio_url is provided or template has audio_file_path
    if (!finalAudioUrl && template.audio_file_path) {
      finalAudioUrl = template.audio_file_path;
    }

    if (!finalAudioUrl) {
      throw new Error("No audio URL available for voicemail campaign");
    }

    // Process in batches for efficiency
    const batchSize = 100;
    const batches: typeof validProspects[] = [];

    for (let i = 0; i < validProspects.length; i += batchSize) {
      batches.push(validProspects.slice(i, i + batchSize));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      // Update job progress
      await job.updateProgress({
        currentBatch: batchIndex + 1,
        totalBatches: batches.length,
        processed: sent + failed,
        total: validProspects.length,
      });

      // Get phone numbers for this batch
      const phoneNumbers = batch.map((p) => p.phone!);

      try {
        // Send batch voicemail
        const result = await slybroadcastService.sendBulkVoicemails(
          phoneNumbers,
          finalAudioUrl,
          {
            campaign_name: `${campaign.name} - Step ${step_number} - Batch ${batchIndex + 1}`,
          }
        );

        if (result.success) {
          sent += batch.length;

          // Log activity for each prospect
          const activityLogs = batch.map((prospect) => ({
            prospect_id: prospect.id,
            campaign_id,
            domain_id: prospect.domain_id,
            activity_type: "voicemail_sent" as const,
            description: `Voicemail sent to ${prospect.phone}`,
            metadata: {
              step: step_number,
              template_id,
              session_id: result.session_id,
              batch: batchIndex + 1,
            },
          }));

          await supabase.from("activity_logs").insert(activityLogs);

          // Update campaign_prospects for each
          for (const prospect of batch) {
            const { data: enrollment } = await supabase
              .from("campaign_prospects")
              .select("voicemails_sent")
              .eq("campaign_id", campaign_id)
              .eq("prospect_id", prospect.id)
              .single();

            await supabase
              .from("campaign_prospects")
              .update({
                current_step: step_number,
                voicemails_sent: (enrollment?.voicemails_sent || 0) + 1,
              })
              .eq("campaign_id", campaign_id)
              .eq("prospect_id", prospect.id);
          }
        } else {
          failed += batch.length;
          console.error(`Batch ${batchIndex + 1} failed:`, result.error);
        }
      } catch (err) {
        failed += batch.length;
        console.error(`Error processing batch ${batchIndex + 1}:`, err);
      }

      // Rate limiting between batches
      if (batchIndex < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
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
    console.error("Voicemail campaign job failed:", err);
    throw err;
  }
}
