import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface JournalNarrationInput {
  matchLabel: string;
  score?: string;
  minute?: number;
  mood?: string;
}

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly client: OpenAI | null;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('openai.apiKey') ?? '';
    this.client = key ? new OpenAI({ apiKey: key }) : null;
  }

  async generateJournalSnippet(input: JournalNarrationInput): Promise<string> {
    if (!this.client) {
      this.logger.warn('OPENAI_API_KEY absent — retour mock');
      return this.mockJournal(input);
    }
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Tu écris des courts paragraphes de journal intime pour un fan de foot pendant la Coupe du monde. Ton chaleureux, au présent, 2-3 phrases.',
          },
          {
            role: 'user',
            content: JSON.stringify(input),
          },
        ],
        max_tokens: 200,
      });
      return completion.choices[0]?.message?.content?.trim() ?? this.mockJournal(input);
    } catch (err) {
      this.logger.error('OpenAI error', err);
      return this.mockJournal(input);
    }
  }

  private mockJournal(input: JournalNarrationInput): string {
    return (
      `[Mock IA] Moment suspendu : ${input.matchLabel}. ` +
      `${input.score ? `Score ${input.score}. ` : ''}` +
      `Le stade respire, l’émotion monte.`
    );
  }
}
