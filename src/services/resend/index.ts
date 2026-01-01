import { Resend } from "resend";

// Types for email delivery
export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailRequest {
  to: EmailRecipient | EmailRecipient[];
  from?: EmailRecipient;
  subject: string;
  html: string;
  text?: string;
  reply_to?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  headers?: Record<string, string>;
  tags?: Array<{ name: string; value: string }>;
  // Tracking
  prospect_id?: string;
  campaign_id?: string;
  domain_id?: string;
}

export interface SendEmailResponse {
  id: string;
  success: boolean;
  error?: string;
}

export interface BatchEmailRequest {
  emails: SendEmailRequest[];
}

export interface BatchEmailResponse {
  results: SendEmailResponse[];
  success_count: number;
  failure_count: number;
}

export interface EmailEvent {
  type: "delivered" | "opened" | "clicked" | "bounced" | "complained" | "unsubscribed";
  email_id: string;
  recipient: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

class ResendService {
  private client: Resend | null = null;
  private defaultFrom: EmailRecipient | null = null;

  private getClient(): Resend {
    if (!this.client) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error("RESEND_API_KEY environment variable is not set");
      }
      this.client = new Resend(apiKey);

      // Set default from address
      const fromEmail = process.env.RESEND_FROM_EMAIL;
      const fromName = process.env.RESEND_FROM_NAME || "Domain Sales";
      if (fromEmail) {
        this.defaultFrom = { email: fromEmail, name: fromName };
      }
    }
    return this.client;
  }

  private formatAddress(recipient: EmailRecipient): string {
    if (recipient.name) {
      return `${recipient.name} <${recipient.email}>`;
    }
    return recipient.email;
  }

  private formatAddresses(recipients: EmailRecipient | EmailRecipient[]): string[] {
    const list = Array.isArray(recipients) ? recipients : [recipients];
    return list.map((r) => this.formatAddress(r));
  }

  /**
   * Send a single email
   */
  async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    const client = this.getClient();

    const from = request.from || this.defaultFrom;
    if (!from) {
      throw new Error("No from address specified and RESEND_FROM_EMAIL not set");
    }

    try {
      // Build custom headers for tracking
      const headers: Record<string, string> = {
        ...request.headers,
      };

      // Add tracking headers
      if (request.prospect_id) {
        headers["X-Prospect-ID"] = request.prospect_id;
      }
      if (request.campaign_id) {
        headers["X-Campaign-ID"] = request.campaign_id;
      }
      if (request.domain_id) {
        headers["X-Domain-ID"] = request.domain_id;
      }

      const { data, error } = await client.emails.send({
        from: this.formatAddress(from),
        to: this.formatAddresses(request.to),
        subject: request.subject,
        html: request.html,
        text: request.text,
        replyTo: request.reply_to,
        cc: request.cc ? this.formatAddresses(request.cc) : undefined,
        bcc: request.bcc ? this.formatAddresses(request.bcc) : undefined,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        tags: request.tags,
      });

      if (error) {
        return {
          id: "",
          success: false,
          error: error.message,
        };
      }

      return {
        id: data?.id || "",
        success: true,
      };
    } catch (err) {
      return {
        id: "",
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  /**
   * Send multiple emails in batch
   */
  async sendBatchEmails(request: BatchEmailRequest): Promise<BatchEmailResponse> {
    const results: SendEmailResponse[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Send emails in parallel with rate limiting
    // Resend has a rate limit of 10 emails/second on free tier
    const batchSize = 10;
    const delayMs = 1100; // Slightly over 1 second to be safe

    for (let i = 0; i < request.emails.length; i += batchSize) {
      const batch = request.emails.slice(i, i + batchSize);

      const batchResults = await Promise.all(batch.map((email) => this.sendEmail(email)));

      for (const result of batchResults) {
        results.push(result);
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      }

      // Wait before next batch if there are more emails
      if (i + batchSize < request.emails.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return {
      results,
      success_count: successCount,
      failure_count: failureCount,
    };
  }

  /**
   * Get email by ID
   */
  async getEmail(emailId: string): Promise<{
    id: string;
    status: string;
    created_at: string;
    to: string[];
    subject: string;
  } | null> {
    const client = this.getClient();

    try {
      const { data, error } = await client.emails.get(emailId);

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        status: data.last_event || "unknown",
        created_at: data.created_at,
        to: data.to,
        subject: data.subject,
      };
    } catch {
      return null;
    }
  }

  /**
   * Build email with tracking pixel (for open tracking)
   */
  addTrackingPixel(html: string, emailId: string, webhookUrl?: string): string {
    if (!webhookUrl) {
      return html;
    }

    const trackingPixel = `<img src="${webhookUrl}?event=open&email_id=${emailId}" width="1" height="1" style="display:none" />`;

    // Insert before closing body tag, or at end if no body tag
    if (html.includes("</body>")) {
      return html.replace("</body>", `${trackingPixel}</body>`);
    }
    return html + trackingPixel;
  }

  /**
   * Build email with tracked links (for click tracking)
   */
  addClickTracking(html: string, emailId: string, webhookUrl?: string): string {
    if (!webhookUrl) {
      return html;
    }

    // Replace href links with tracked versions
    return html.replace(
      /href="(https?:\/\/[^"]+)"/g,
      (match, url) => {
        const trackedUrl = `${webhookUrl}?event=click&email_id=${emailId}&url=${encodeURIComponent(url)}`;
        return `href="${trackedUrl}"`;
      }
    );
  }

  /**
   * Create an unsubscribe link
   */
  createUnsubscribeLink(baseUrl: string, prospectId: string, token: string): string {
    return `${baseUrl}/unsubscribe?prospect_id=${prospectId}&token=${token}`;
  }

  /**
   * Build complete HTML email with all tracking
   */
  buildTrackedEmail(options: {
    html: string;
    emailId: string;
    prospectId: string;
    webhookUrl?: string;
    unsubscribeUrl?: string;
    unsubscribeToken?: string;
  }): string {
    let result = options.html;

    // Add tracking pixel
    if (options.webhookUrl) {
      result = this.addTrackingPixel(result, options.emailId, options.webhookUrl);
      result = this.addClickTracking(result, options.emailId, options.webhookUrl);
    }

    // Add unsubscribe link if not present
    if (options.unsubscribeUrl && options.unsubscribeToken) {
      const unsubLink = this.createUnsubscribeLink(
        options.unsubscribeUrl,
        options.prospectId,
        options.unsubscribeToken
      );

      if (!result.includes("unsubscribe")) {
        const footer = `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <a href="${unsubLink}" style="color: #666;">Unsubscribe</a> from these emails.
          </div>
        `;

        if (result.includes("</body>")) {
          result = result.replace("</body>", `${footer}</body>`);
        } else {
          result += footer;
        }
      }
    }

    return result;
  }

  /**
   * Estimate monthly cost based on email count
   * Resend pricing: Free tier (100/day), then ~$0.90/1000 emails
   */
  estimateMonthlyCost(emailsPerMonth: number, pricePerThousand: number = 0.90): number {
    const freeEmails = 3000; // ~100/day free tier
    const billableEmails = Math.max(0, emailsPerMonth - freeEmails);
    return (billableEmails / 1000) * pricePerThousand;
  }
}

// Export singleton instance
export const resendService = new ResendService();

// Export class for testing
export { ResendService };
