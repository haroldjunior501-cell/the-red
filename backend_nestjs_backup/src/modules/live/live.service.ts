import { Injectable } from '@nestjs/common';
import { SportmonksService } from '../../integrations/sportmonks/sportmonks.service';
import { EventEngineService } from '../events/event-engine.service';

@Injectable()
export class LiveService {
  constructor(
    private readonly sportmonks: SportmonksService,
    private readonly events: EventEngineService,
  ) {}

  async snapshot(): Promise<{ backup: Record<string, unknown>[]; emitted: boolean }> {
    const backup = await this.sportmonks.fetchLivescoresBackup();
    await this.events.emitSynthetic('live.tick', {
      source: 'live',
      at: new Date().toISOString(),
      backupSize: backup.length,
    });
    return { backup, emitted: true };
  }
}
