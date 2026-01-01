// Slybroadcast Ringless Voicemail Service
// API Docs: https://www.slybroadcast.com/documentation.php

export interface SlybroadcastCredentials {
  email: string;
  password: string;
  caller_id: string;
}

export interface CampaignRequest {
  phone_numbers: string[];
  audio_file_name?: string; // Stored audio file name
  audio_url?: string; // External audio URL
  audio_type?: "wav" | "mp3" | "m4a";
  caller_id?: string;
  scheduled_time?: Date | "now";
  campaign_name?: string;
  mobile_only?: boolean;
  webhook_url?: string;
}

export interface CampaignResponse {
  success: boolean;
  session_id?: string;
  phone_count?: number;
  error?: string;
}

export interface CampaignStatus {
  session_id: string;
  call_to: string;
  status: "delivered" | "failed" | "pending" | "busy" | "no_answer" | string;
  reason?: string;
  delivery_time?: string;
  carrier?: string;
}

export interface AudioFile {
  name: string;
  duration_seconds?: number;
  created_at?: string;
}

export type CampaignAction = "pause" | "run" | "stop" | "cancel";

const SLYBROADCAST_API_URL = "https://www.mobile-sphere.com/gateway/vmb.php";
const SLYBROADCAST_AUDIO_LIST_URL = "https://www.mobile-sphere.com/gateway/vmb.aflist.php";

class SlybroadcastService {
  private credentials: SlybroadcastCredentials | null = null;

  private getCredentials(): SlybroadcastCredentials {
    if (!this.credentials) {
      const email = process.env.SLYBROADCAST_EMAIL;
      const password = process.env.SLYBROADCAST_PASSWORD;
      const callerId = process.env.SLYBROADCAST_CALLER_ID;

      if (!email || !password) {
        throw new Error("SLYBROADCAST_EMAIL and SLYBROADCAST_PASSWORD environment variables are required");
      }

      if (!callerId) {
        throw new Error("SLYBROADCAST_CALLER_ID environment variable is required");
      }

      this.credentials = {
        email,
        password,
        caller_id: callerId,
      };
    }
    return this.credentials;
  }

  /**
   * Format phone number for Slybroadcast (US format, digits only)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");

    // If 10 digits, assume US number and add 1
    if (digits.length === 10) {
      return `1${digits}`;
    }

    // If 11 digits starting with 1, use as-is
    if (digits.length === 11 && digits.startsWith("1")) {
      return digits;
    }

    // Return as-is and let Slybroadcast validate
    return digits;
  }

  /**
   * Format date for Slybroadcast (Eastern Time)
   */
  private formatDate(date: Date): string {
    // Format: YYYY-MM-DD HH:MM:SS in Eastern Time
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";

    return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
  }

  /**
   * Parse Slybroadcast response
   */
  private parseResponse(response: string): CampaignResponse {
    // Success format: "OK session_id=9377466671 number of phone=1"
    if (response.startsWith("OK")) {
      const sessionMatch = response.match(/session_id=(\d+)/);
      const phoneMatch = response.match(/number of phone=(\d+)/);

      return {
        success: true,
        session_id: sessionMatch?.[1],
        phone_count: phoneMatch ? parseInt(phoneMatch[1], 10) : undefined,
      };
    }

    // Error response
    return {
      success: false,
      error: response || "Unknown error",
    };
  }

  /**
   * Submit a voicemail campaign
   */
  async submitCampaign(request: CampaignRequest): Promise<CampaignResponse> {
    const creds = this.getCredentials();

    // Validate phone numbers
    if (!request.phone_numbers || request.phone_numbers.length === 0) {
      return { success: false, error: "No phone numbers provided" };
    }

    if (request.phone_numbers.length > 10000) {
      return { success: false, error: "Maximum 10,000 phone numbers per campaign" };
    }

    // Validate audio source
    if (!request.audio_file_name && !request.audio_url) {
      return { success: false, error: "Either audio_file_name or audio_url is required" };
    }

    // Build form data
    const formData = new URLSearchParams();
    formData.append("c_uid", creds.email);
    formData.append("c_password", creds.password);
    formData.append("c_callerID", request.caller_id || creds.caller_id);

    // Phone numbers (comma-separated)
    const formattedPhones = request.phone_numbers.map((p) => this.formatPhoneNumber(p));
    formData.append("c_phone", formattedPhones.join(","));

    // Audio source
    if (request.audio_file_name) {
      formData.append("c_record_audio", request.audio_file_name);
    } else if (request.audio_url) {
      formData.append("c_url", request.audio_url);
      formData.append("c_audio", request.audio_type || "mp3");
    }

    // Schedule
    if (request.scheduled_time) {
      if (request.scheduled_time === "now") {
        formData.append("c_date", "now");
      } else {
        formData.append("c_date", this.formatDate(request.scheduled_time));
      }
    } else {
      formData.append("c_date", "now");
    }

    // Optional fields
    if (request.campaign_name) {
      formData.append("c_title", request.campaign_name);
    }

    if (request.mobile_only) {
      formData.append("mobile_only", "1");
    }

    if (request.webhook_url) {
      formData.append("c_dispo_url", request.webhook_url);
    }

    try {
      const response = await fetch(SLYBROADCAST_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const text = await response.text();
      return this.parseResponse(text);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  }

  /**
   * Control a campaign (pause, run, stop, cancel)
   */
  async controlCampaign(sessionId: string, action: CampaignAction): Promise<CampaignResponse> {
    const creds = this.getCredentials();

    const formData = new URLSearchParams();
    formData.append("c_uid", creds.email);
    formData.append("c_password", creds.password);
    formData.append("c_option", action);
    formData.append("session_id", sessionId);

    try {
      const response = await fetch(SLYBROADCAST_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const text = await response.text();
      return this.parseResponse(text);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  }

  /**
   * Get list of audio files in account
   */
  async getAudioFiles(): Promise<AudioFile[]> {
    const creds = this.getCredentials();

    const formData = new URLSearchParams();
    formData.append("c_uid", creds.email);
    formData.append("c_password", creds.password);

    try {
      const response = await fetch(SLYBROADCAST_AUDIO_LIST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const text = await response.text();

      // Parse response - format varies, basic parsing
      if (text.toLowerCase().includes("error") || text.toLowerCase().includes("fail")) {
        return [];
      }

      // Split by newlines and parse each file
      const lines = text.split("\n").filter((line) => line.trim());
      return lines.map((line) => ({ name: line.trim() }));
    } catch {
      return [];
    }
  }

  /**
   * Send a single voicemail drop
   */
  async sendVoicemail(
    phoneNumber: string,
    audioUrl: string,
    options?: {
      campaign_name?: string;
      webhook_url?: string;
    }
  ): Promise<CampaignResponse> {
    return this.submitCampaign({
      phone_numbers: [phoneNumber],
      audio_url: audioUrl,
      audio_type: "mp3",
      scheduled_time: "now",
      campaign_name: options?.campaign_name,
      webhook_url: options?.webhook_url,
    });
  }

  /**
   * Send bulk voicemails
   */
  async sendBulkVoicemails(
    phoneNumbers: string[],
    audioUrl: string,
    options?: {
      campaign_name?: string;
      scheduled_time?: Date;
      mobile_only?: boolean;
      webhook_url?: string;
    }
  ): Promise<CampaignResponse> {
    return this.submitCampaign({
      phone_numbers: phoneNumbers,
      audio_url: audioUrl,
      audio_type: "mp3",
      scheduled_time: options?.scheduled_time || "now",
      campaign_name: options?.campaign_name,
      mobile_only: options?.mobile_only,
      webhook_url: options?.webhook_url,
    });
  }

  /**
   * Estimate cost for voicemail campaign
   * Slybroadcast pricing: typically $0.08-0.10 per successful delivery
   */
  estimateCost(phoneCount: number, pricePerVoicemail: number = 0.09): number {
    return phoneCount * pricePerVoicemail;
  }

  /**
   * Validate that a phone number is likely deliverable
   */
  isValidUSPhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, "");
    // Valid US phone: 10 digits, or 11 digits starting with 1
    return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
  }

  /**
   * Filter to only valid phone numbers
   */
  filterValidPhones(phones: string[]): string[] {
    return phones.filter((p) => this.isValidUSPhone(p));
  }
}

// Export singleton instance
export const slybroadcastService = new SlybroadcastService();

// Export class for testing
export { SlybroadcastService };
