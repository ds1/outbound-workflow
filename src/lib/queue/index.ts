import { Queue, Worker, Job, QueueEvents } from "bullmq";
import { getRedisConnection } from "./connection";

// Queue names
export const QUEUE_NAMES = {
  EMAIL_CAMPAIGN: "email-campaign",
  VOICEMAIL_CAMPAIGN: "voicemail-campaign",
  SCHEDULED_TASKS: "scheduled-tasks",
} as const;

// Job types
export type EmailCampaignJobData = {
  type: "send_email" | "send_batch";
  campaign_id: string;
  prospect_ids: string[];
  step_number: number;
  template_id: string;
  scheduled_for?: string;
};

export type VoicemailCampaignJobData = {
  type: "send_voicemail" | "send_batch";
  campaign_id: string;
  prospect_ids: string[];
  step_number: number;
  template_id: string;
  audio_url: string;
  scheduled_for?: string;
};

export type ScheduledTaskJobData = {
  type: "process_campaign_step" | "check_escalations" | "cleanup_logs";
  campaign_id?: string;
  step_number?: number;
};

// Queue instances (lazy initialization)
let emailQueue: Queue<EmailCampaignJobData> | null = null;
let voicemailQueue: Queue<VoicemailCampaignJobData> | null = null;
let scheduledQueue: Queue<ScheduledTaskJobData> | null = null;

export function getEmailQueue(): Queue<EmailCampaignJobData> {
  if (!emailQueue) {
    emailQueue = new Queue(QUEUE_NAMES.EMAIL_CAMPAIGN, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: {
          count: 1000,
          age: 24 * 60 * 60, // 24 hours
        },
        removeOnFail: {
          count: 5000,
          age: 7 * 24 * 60 * 60, // 7 days
        },
      },
    });
  }
  return emailQueue;
}

export function getVoicemailQueue(): Queue<VoicemailCampaignJobData> {
  if (!voicemailQueue) {
    voicemailQueue = new Queue(QUEUE_NAMES.VOICEMAIL_CAMPAIGN, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 10000,
        },
        removeOnComplete: {
          count: 1000,
          age: 24 * 60 * 60,
        },
        removeOnFail: {
          count: 5000,
          age: 7 * 24 * 60 * 60,
        },
      },
    });
  }
  return voicemailQueue;
}

export function getScheduledQueue(): Queue<ScheduledTaskJobData> {
  if (!scheduledQueue) {
    scheduledQueue = new Queue(QUEUE_NAMES.SCHEDULED_TASKS, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: "fixed",
          delay: 60000,
        },
        removeOnComplete: {
          count: 500,
          age: 12 * 60 * 60,
        },
        removeOnFail: {
          count: 1000,
          age: 3 * 24 * 60 * 60,
        },
      },
    });
  }
  return scheduledQueue;
}

// Helper to add jobs with delay
export async function scheduleEmailJob(
  data: EmailCampaignJobData,
  delay?: number
): Promise<Job<EmailCampaignJobData>> {
  const queue = getEmailQueue();
  return queue.add(`email-${data.campaign_id}-step-${data.step_number}`, data, {
    delay,
    priority: 1,
  });
}

export async function scheduleVoicemailJob(
  data: VoicemailCampaignJobData,
  delay?: number
): Promise<Job<VoicemailCampaignJobData>> {
  const queue = getVoicemailQueue();
  return queue.add(`voicemail-${data.campaign_id}-step-${data.step_number}`, data, {
    delay,
    priority: 1,
  });
}

export async function scheduleTask(
  data: ScheduledTaskJobData,
  options?: { delay?: number; repeat?: { pattern: string } }
): Promise<Job<ScheduledTaskJobData>> {
  const queue = getScheduledQueue();
  const jobName = `task-${data.type}-${data.campaign_id || "global"}`;

  return queue.add(jobName, data, {
    delay: options?.delay,
    repeat: options?.repeat,
  });
}

// Get queue stats
export async function getQueueStats() {
  const email = getEmailQueue();
  const voicemail = getVoicemailQueue();
  const scheduled = getScheduledQueue();

  const [emailCounts, voicemailCounts, scheduledCounts] = await Promise.all([
    email.getJobCounts(),
    voicemail.getJobCounts(),
    scheduled.getJobCounts(),
  ]);

  return {
    email: emailCounts,
    voicemail: voicemailCounts,
    scheduled: scheduledCounts,
  };
}

// Export types
export type { Queue, Worker, Job, QueueEvents };
