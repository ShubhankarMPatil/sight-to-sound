
interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

interface GenerateSpeechParams {
  text: string;
  voiceId: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
}

class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSpeech({
    text,
    voiceId,
    model = 'eleven_multilingual_v2',
    stability = 0.5,
    similarityBoost = 0.75
  }: GenerateSpeechParams): Promise<ArrayBuffer> {
    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    return response.arrayBuffer();
  }

  async getVoices(): Promise<ElevenLabsVoice[]> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.voices;
  }
}

export default ElevenLabsService;
export type { ElevenLabsVoice, GenerateSpeechParams };
