import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface FixtureSummaryDto {
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  status: string;
}

@Injectable()
export class ApiFootballService {
  private readonly logger = new Logger(ApiFootballService.name);
  private readonly http: AxiosInstance;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    const baseURL = this.config.get<string>('apiFootball.baseUrl')!;
    this.apiKey = this.config.get<string>('apiFootball.apiKey') ?? '';
    this.http = axios.create({
      baseURL,
      timeout: 15_000,
      headers: this.apiKey
        ? { 'x-apisports-key': this.apiKey }
        : undefined,
    });
  }

  /**
   * Retourne des fixtures mock si pas de clé API (développement).
   */
  async listUpcomingFixtures(limit = 5): Promise<FixtureSummaryDto[]> {
    if (!this.apiKey) {
      this.logger.warn('API_FOOTBALL_KEY absent — retour mock');
      return this.mockFixtures(limit);
    }
    try {
      const { data } = await this.http.get('/fixtures', {
        params: { next: limit },
      });
      const raw = data?.response ?? [];
      return raw.map((f: any) => ({
        externalId: String(f.fixture?.id ?? ''),
        homeTeam: f.teams?.home?.name ?? 'Home',
        awayTeam: f.teams?.away?.name ?? 'Away',
        kickoffAt: f.fixture?.date ?? new Date().toISOString(),
        status: f.fixture?.status?.short ?? 'NS',
      }));
    } catch (err) {
      this.logger.error('API-Football error, fallback mock', err);
      return this.mockFixtures(limit);
    }
  }

  private mockFixtures(limit: number): FixtureSummaryDto[] {
    const base = Date.now();
    return Array.from({ length: limit }, (_, i) => ({
      externalId: `mock-${i + 1}`,
      homeTeam: `Pays ${i * 2 + 1}`,
      awayTeam: `Pays ${i * 2 + 2}`,
      kickoffAt: new Date(base + i * 3_600_000).toISOString(),
      status: 'NS',
    }));
  }
}
