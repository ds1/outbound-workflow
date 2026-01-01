import { Worker } from "bullmq";
import { getRedisConnection } from "@/lib/queue/connection";
import { QUEUE_NAMES } from "@/lib/queue";
import { processEmailCampaignJob } from "./email-campaign.worker";
import { processVoicemailCampaignJob } from "./voicemail-campaign.worker";
import { processScheduledTask } from "./scheduled-tasks.worker";

// Initialize workers
export function startWorkers() {
  const connection = getRedisConnection();

  // Email campaign worker
  const emailWorker = new Worker(
    QUEUE_NAMES.EMAIL_CAMPAIGN,
    async (job) => {
      console.log(`Processing email job: ${job.id}`);
      return processEmailCampaignJob(job);
    },
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000, // 10 jobs per second
      },
    }
  );

  emailWorker.on("completed", (job, result) => {
    console.log(`Email job ${job.id} completed:`, result);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err);
  });

  // Voicemail campaign worker
  const voicemailWorker = new Worker(
    QUEUE_NAMES.VOICEMAIL_CAMPAIGN,
    async (job) => {
      console.log(`Processing voicemail job: ${job.id}`);
      return processVoicemailCampaignJob(job);
    },
    {
      connection,
      concurrency: 2,
      limiter: {
        max: 5,
        duration: 1000, // 5 jobs per second
      },
    }
  );

  voicemailWorker.on("completed", (job, result) => {
    console.log(`Voicemail job ${job.id} completed:`, result);
  });

  voicemailWorker.on("failed", (job, err) => {
    console.error(`Voicemail job ${job?.id} failed:`, err);
  });

  // Scheduled tasks worker
  const scheduledWorker = new Worker(
    QUEUE_NAMES.SCHEDULED_TASKS,
    async (job) => {
      console.log(`Processing scheduled task: ${job.id}`);
      return processScheduledTask(job);
    },
    {
      connection,
      concurrency: 3,
    }
  );

  scheduledWorker.on("completed", (job, result) => {
    console.log(`Scheduled task ${job.id} completed:`, result);
  });

  scheduledWorker.on("failed", (job, err) => {
    console.error(`Scheduled task ${job?.id} failed:`, err);
  });

  console.log("Workers started successfully");

  // Return workers for graceful shutdown
  return {
    emailWorker,
    voicemailWorker,
    scheduledWorker,
    async shutdown() {
      await emailWorker.close();
      await voicemailWorker.close();
      await scheduledWorker.close();
      console.log("Workers shut down");
    },
  };
}

// Run workers if executed directly
if (require.main === module) {
  const workers = startWorkers();

  // Handle graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down...");
    await workers.shutdown();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down...");
    await workers.shutdown();
    process.exit(0);
  });
}
