import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createClient } from "@/lib/supabase/client";

// Types for voice synthesis
export interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  preview_url?: string;
  labels?: Record<string, string>;
}

export interface VoiceSettings {
  stability?: number; // 0-1, default 0.5
  similarity_boost?: number; // 0-1, default 0.75
  style?: number; // 0-1, default 0
  use_speaker_boost?: boolean;
}

export interface TextToSpeechRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  output_format?: "mp3_44100_128" | "mp3_44100_192" | "pcm_16000" | "pcm_22050" | "pcm_24000";
}

export interface TextToSpeechResponse {
  audio: Buffer;
  content_type: string;
  duration_seconds?: number;
}

export interface VoiceCloneRequest {
  name: string;
  description?: string;
  files: File[] | Buffer[];
  labels?: Record<string, string>;
}

// Model IDs
export const ELEVENLABS_MODELS = {
  MULTILINGUAL_V2: "eleven_multilingual_v2", // Highest quality, 32 languages
  FLASH_V2_5: "eleven_flash_v2_5", // Ultra-low latency (75ms)
  TURBO_V2_5: "eleven_turbo_v2_5", // Low latency, English only
  ENGLISH_V1: "eleven_monolingual_v1", // Legacy English
} as const;

// Default voice settings optimized for voicemail
export const DEFAULT_VOICEMAIL_SETTINGS: VoiceSettings = {
  stability: 0.6,
  similarity_boost: 0.8,
  style: 0.2,
  use_speaker_boost: true,
};

class ElevenLabsService {
  private client: ElevenLabsClient | null = null;

  private getClient(): ElevenLabsClient {
    if (!this.client) {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        throw new Error("ELEVENLABS_API_KEY environment variable is not set");
      }
      this.client = new ElevenLabsClient({ apiKey });
    }
    return this.client;
  }

  /**
   * Get list of available voices
   */
  async getVoices(): Promise<Voice[]> {
    const client = this.getClient();
    const response = await client.voices.getAll();

    return response.voices.map((voice) => ({
      voice_id: voice.voiceId,
      name: voice.name ?? "Unknown",
      category: voice.category ?? undefined,
      description: voice.description ?? undefined,
      preview_url: voice.previewUrl ?? undefined,
      labels: voice.labels ?? undefined,
    }));
  }

  /**
   * Get a specific voice by ID
   */
  async getVoice(voiceId: string): Promise<Voice | null> {
    const client = this.getClient();

    try {
      const voice = await client.voices.get(voiceId);
      return {
        voice_id: voice.voiceId,
        name: voice.name ?? "Unknown",
        category: voice.category ?? undefined,
        description: voice.description ?? undefined,
        preview_url: voice.previewUrl ?? undefined,
        labels: voice.labels ?? undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Convert text to speech audio
   */
  async textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    const client = this.getClient();

    const audioStream = await client.textToSpeech.convert(request.voice_id, {
      text: request.text,
      modelId: request.model_id || ELEVENLABS_MODELS.MULTILINGUAL_V2,
      voiceSettings: request.voice_settings
        ? {
            stability: request.voice_settings.stability,
            similarityBoost: request.voice_settings.similarity_boost,
            style: request.voice_settings.style,
            useSpeakerBoost: request.voice_settings.use_speaker_boost,
          }
        : undefined,
    });

    // Collect stream chunks into buffer
    const chunks: Uint8Array[] = [];
    const reader = audioStream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    const audio = Buffer.concat(chunks);

    // Estimate duration based on audio size (rough estimate for MP3)
    // MP3 at 128kbps = 16KB per second
    const estimatedDuration = audio.length / (16 * 1024);

    return {
      audio,
      content_type: "audio/mpeg",
      duration_seconds: Math.round(estimatedDuration),
    };
  }

  /**
   * Generate voicemail audio from script
   */
  async generateVoicemailAudio(
    script: string,
    voiceId: string,
    settings?: VoiceSettings
  ): Promise<TextToSpeechResponse> {
    return this.textToSpeech({
      text: script,
      voice_id: voiceId,
      model_id: ELEVENLABS_MODELS.MULTILINGUAL_V2,
      voice_settings: settings || DEFAULT_VOICEMAIL_SETTINGS,
      output_format: "mp3_44100_128",
    });
  }

  /**
   * Upload audio to Supabase storage and return the URL
   */
  async uploadAudioToStorage(
    audio: Buffer,
    filename: string,
    bucket: string = "voicemail-audio"
  ): Promise<string> {
    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, audio, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload audio: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  /**
   * Generate voicemail and store in Supabase
   */
  async generateAndStoreVoicemail(
    script: string,
    voiceId: string,
    templateId: string,
    settings?: VoiceSettings
  ): Promise<{ url: string; duration_seconds: number }> {
    // Generate audio
    const { audio, duration_seconds } = await this.generateVoicemailAudio(script, voiceId, settings);

    // Create unique filename
    const timestamp = Date.now();
    const filename = `voicemail_${templateId}_${timestamp}.mp3`;

    // Upload to storage
    const url = await this.uploadAudioToStorage(audio, filename);

    return {
      url,
      duration_seconds: duration_seconds || 0,
    };
  }

  /**
   * Get voice usage/quota information
   */
  async getUsage(): Promise<{
    character_count: number;
    character_limit: number;
    remaining_characters: number;
  }> {
    const client = this.getClient();
    const subscription = await client.user.subscription.get();

    return {
      character_count: subscription.characterCount ?? 0,
      character_limit: subscription.characterLimit ?? 0,
      remaining_characters: (subscription.characterLimit ?? 0) - (subscription.characterCount ?? 0),
    };
  }

  /**
   * Estimate cost for text-to-speech
   * ElevenLabs charges per character
   */
  estimateCost(text: string, pricePerThousandChars: number = 0.30): number {
    const charCount = text.length;
    return (charCount / 1000) * pricePerThousandChars;
  }

  /**
   * Estimate audio duration from text
   * Average speaking rate is about 150 words per minute (2.5 words per second)
   */
  estimateDuration(text: string): number {
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / 2.5);
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService();

// Export class for testing
export { ElevenLabsService };
