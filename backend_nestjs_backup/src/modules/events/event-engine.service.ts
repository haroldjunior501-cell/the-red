import { Injectable, Logger } from '@nestjs/common';
import { LIVE_CHANNEL } from '../../common/constants/live-channel';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class EventEngineService {
  private readonly logger = new Logger(EventEngineService.name);

  constructor(private readonly redis: RedisService) {}

  /**
   * Point d’entrée central pour les événements métier (but, carton, phase de jeu…).
   * Publie sur Redis ; `LiveGateway` s’abonne et diffuse sur Socket.IO (plusieurs instances API).
   */
  async emitSynthetic(type: string, payload: Record<string, unknown>): Promise<void> {
    const envelope = { type, payload, ts: new Date().toISOString() };
    try {
      await this.redis.pub.publish(LIVE_CHANNEL, JSON.stringify(envelope));
    } catch (err) {
      this.logger.error('Redis publish failed', err);
    }
  }
}
