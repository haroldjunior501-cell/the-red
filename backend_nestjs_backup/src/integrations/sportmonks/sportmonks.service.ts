import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class SportmonksService {
  private readonly logger = new Logger(SportmonksService.name);
  private readonly http: AxiosInstance;
  private readonly token: string;

  constructor(private readonly config: ConfigService) {
    const baseURL = this.config.get<string>('sportmonks.baseUrl')!;
    this.token = this.config.get<string>('sportmonks.token') ?? '';
    this.http = axios.create({
      baseURL,
      timeout: 15_000,
    });
  }

  async fetchLivescoresBackup(): Promise<Record<string, unknown>[]> {
    if (!this.token) {
      this.logger.warn('SPORTMONKS_TOKEN absent — retour mock');
      return [{ source: 'sportmonks', status: 'mock', message: 'configure token' }];
    }
    try {
      const { data } = await this.http.get('/livescores/inplay', {
        params: { api_token: this.token },
      });
      return Array.isArray(data?.data) ? data.data : [];
    } catch (err) {
      this.logger.error('Sportmonks error', err);
      return [];
    }
  }
}
