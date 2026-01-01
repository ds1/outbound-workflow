import Anthropic from "@anthropic-ai/sdk";

// Types for content generation
export interface LeadContext {
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  email?: string | null;
}

export interface DomainContext {
  name: string;
  tld: string;
  full_domain: string;
  buy_now_price?: number | null;
  floor_price?: number | null;
  landing_page_url?: string | null;
}

export interface SenderContext {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface EmailGenerationRequest {
  lead: LeadContext;
  domain: DomainContext;
  sender: SenderContext;
  tone?: "professional" | "friendly" | "casual" | "urgent";
  purpose?: "initial_outreach" | "follow_up" | "price_negotiation" | "final_offer";
  customInstructions?: string;
}

export interface EmailGenerationResponse {
  subject: string;
  body_html: string;
  body_text: string;
  preview_text: string;
}

export interface VoicemailGenerationRequest {
  lead: LeadContext;
  domain: DomainContext;
  sender: SenderContext;
  tone?: "professional" | "friendly" | "casual" | "urgent";
  purpose?: "initial_outreach" | "follow_up" | "price_negotiation" | "final_offer";
  maxDurationSeconds?: number;
  customInstructions?: string;
}

export interface VoicemailGenerationResponse {
  script: string;
  estimated_duration_seconds: number;
}

export interface SubjectLineRequest {
  domain: DomainContext;
  lead?: LeadContext;
  count?: number;
  style?: "question" | "statement" | "urgency" | "curiosity";
}

export interface SubjectLineResponse {
  subjects: string[];
}

class ClaudeService {
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY environment variable is not set");
      }
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  /**
   * Generate a personalized email for domain outreach
   */
  async generateEmail(request: EmailGenerationRequest): Promise<EmailGenerationResponse> {
    const client = this.getClient();

    const toneDescriptions = {
      professional: "professional and business-like",
      friendly: "warm and friendly while remaining professional",
      casual: "casual and conversational",
      urgent: "conveying urgency without being pushy",
    };

    const purposeDescriptions = {
      initial_outreach: "This is the first contact with the prospect.",
      follow_up: "This is a follow-up to a previous email that received no response.",
      price_negotiation: "The prospect has shown interest and we're discussing price.",
      final_offer: "This is a final offer before moving on.",
    };

    const prompt = `Generate a personalized sales email for selling the domain "${request.domain.full_domain}".

CONTEXT:
- Domain: ${request.domain.full_domain}
- Buy-It-Now Price: ${request.domain.buy_now_price ? `$${request.domain.buy_now_price.toLocaleString()}` : "Make an offer"}
- Floor Price: ${request.domain.floor_price ? `$${request.domain.floor_price.toLocaleString()}` : "Negotiable"}
- Landing Page: ${request.domain.landing_page_url || "Not set"}

RECIPIENT:
- Name: ${request.lead.first_name || "there"} ${request.lead.last_name || ""}
- Company: ${request.lead.company_name || "Unknown"}
- Email: ${request.lead.email || "Unknown"}

SENDER:
- Name: ${request.sender.name}
- Email: ${request.sender.email}
- Phone: ${request.sender.phone || "Not provided"}
- Company: ${request.sender.company || "Independent domain investor"}

TONE: ${toneDescriptions[request.tone || "professional"]}
PURPOSE: ${purposeDescriptions[request.purpose || "initial_outreach"]}

${request.customInstructions ? `ADDITIONAL INSTRUCTIONS: ${request.customInstructions}` : ""}

Generate the email in the following JSON format:
{
  "subject": "Email subject line (compelling, under 60 characters)",
  "body_html": "HTML formatted email body with proper paragraphs using <p> tags",
  "body_text": "Plain text version of the email",
  "preview_text": "Preview text for email clients (under 100 characters)"
}

Guidelines:
- Keep the email concise (under 200 words)
- Focus on the value proposition for the recipient
- Include a clear call-to-action
- Personalize based on the recipient's company if known
- Don't be overly salesy or use spammy language
- Make the domain name prominent`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Extract JSON from the response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from Claude response");
    }

    return JSON.parse(jsonMatch[0]) as EmailGenerationResponse;
  }

  /**
   * Generate a voicemail script for domain outreach
   */
  async generateVoicemailScript(request: VoicemailGenerationRequest): Promise<VoicemailGenerationResponse> {
    const client = this.getClient();

    const maxDuration = request.maxDurationSeconds || 30;
    const maxWords = Math.floor(maxDuration * 2.5); // ~2.5 words per second

    const toneDescriptions = {
      professional: "professional and business-like",
      friendly: "warm and friendly",
      casual: "casual and conversational",
      urgent: "conveying importance without being pushy",
    };

    const purposeDescriptions = {
      initial_outreach: "This is the first voicemail to the prospect.",
      follow_up: "This is a follow-up voicemail after no response.",
      price_negotiation: "The prospect has shown interest.",
      final_offer: "This is a final attempt to connect.",
    };

    const prompt = `Generate a voicemail script for selling the domain "${request.domain.full_domain}".

CONTEXT:
- Domain: ${request.domain.full_domain}
- Price: ${request.domain.buy_now_price ? `$${request.domain.buy_now_price.toLocaleString()}` : "Make an offer"}
- Landing Page: ${request.domain.landing_page_url || "Not set"}

RECIPIENT:
- Name: ${request.lead.first_name || ""} ${request.lead.last_name || ""}
- Company: ${request.lead.company_name || ""}

CALLER:
- Name: ${request.sender.name}
- Phone: ${request.sender.phone || ""}

TONE: ${toneDescriptions[request.tone || "friendly"]}
PURPOSE: ${purposeDescriptions[request.purpose || "initial_outreach"]}

${request.customInstructions ? `ADDITIONAL INSTRUCTIONS: ${request.customInstructions}` : ""}

CONSTRAINTS:
- Maximum ${maxWords} words (approximately ${maxDuration} seconds when spoken)
- Must sound natural when spoken aloud
- Include the domain name clearly (spell it out if necessary)
- End with a clear call-to-action and callback number

Generate the voicemail in the following JSON format:
{
  "script": "The voicemail script text",
  "estimated_duration_seconds": <number>
}

Guidelines:
- Start with a friendly greeting using their name if available
- State who you are and why you're calling
- Mention the domain name clearly
- Keep it conversational, not scripted-sounding
- End with contact information and a reason to call back`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Extract JSON from the response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from Claude response");
    }

    return JSON.parse(jsonMatch[0]) as VoicemailGenerationResponse;
  }

  /**
   * Generate multiple subject line variations
   */
  async generateSubjectLines(request: SubjectLineRequest): Promise<SubjectLineResponse> {
    const client = this.getClient();

    const count = request.count || 5;
    const styleDescriptions = {
      question: "Ask engaging questions",
      statement: "Make bold statements",
      urgency: "Create a sense of urgency",
      curiosity: "Spark curiosity",
    };

    const prompt = `Generate ${count} email subject lines for selling the domain "${request.domain.full_domain}".

DOMAIN INFO:
- Domain: ${request.domain.full_domain}
- Price: ${request.domain.buy_now_price ? `$${request.domain.buy_now_price.toLocaleString()}` : "Make an offer"}

${request.lead?.company_name ? `RECIPIENT COMPANY: ${request.lead.company_name}` : ""}

STYLE: ${styleDescriptions[request.style || "curiosity"]}

Generate exactly ${count} subject lines in the following JSON format:
{
  "subjects": ["subject1", "subject2", "subject3", ...]
}

Guidelines:
- Keep each subject under 60 characters
- Make them compelling and not spammy
- Vary the approaches
- Include the domain name in at least 2 subjects
- Avoid ALL CAPS or excessive punctuation`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Extract JSON from the response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from Claude response");
    }

    return JSON.parse(jsonMatch[0]) as SubjectLineResponse;
  }

  /**
   * Personalize an existing template with lead and domain data
   */
  async personalizeTemplate(
    template: string,
    lead: LeadContext,
    domain: DomainContext,
    sender: SenderContext
  ): Promise<string> {
    // Simple variable replacement without AI
    let result = template;

    // Lead variables
    result = result.replace(/\{\{lead\.first_name\}\}/g, lead.first_name || "there");
    result = result.replace(/\{\{lead\.last_name\}\}/g, lead.last_name || "");
    result = result.replace(/\{\{lead\.company\}\}/g, lead.company_name || "your company");
    result = result.replace(/\{\{lead\.email\}\}/g, lead.email || "");

    // Domain variables
    result = result.replace(/\{\{domain\.name\}\}/g, domain.name);
    result = result.replace(/\{\{domain\.full\}\}/g, domain.full_domain);
    result = result.replace(
      /\{\{domain\.price\}\}/g,
      domain.buy_now_price ? `$${domain.buy_now_price.toLocaleString()}` : "make an offer"
    );
    result = result.replace(/\{\{domain\.url\}\}/g, domain.landing_page_url || domain.full_domain);

    // Sender variables
    result = result.replace(/\{\{sender\.name\}\}/g, sender.name);
    result = result.replace(/\{\{sender\.email\}\}/g, sender.email);
    result = result.replace(/\{\{sender\.phone\}\}/g, sender.phone || "");

    return result;
  }

  /**
   * Improve or rewrite existing content
   */
  async improveContent(
    content: string,
    contentType: "email" | "voicemail",
    instructions?: string
  ): Promise<string> {
    const client = this.getClient();

    const prompt = `Improve the following ${contentType} content for domain sales outreach.

ORIGINAL CONTENT:
${content}

${instructions ? `SPECIFIC INSTRUCTIONS: ${instructions}` : ""}

Provide only the improved content, no explanations. Keep the same general structure but enhance:
- Clarity and conciseness
- Persuasiveness
- Professional tone
- Call-to-action effectiveness`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    return textContent.text.trim();
  }
}

// Export singleton instance
export const claudeService = new ClaudeService();

// Export class for testing
export { ClaudeService };
