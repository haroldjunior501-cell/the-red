import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly subscriber: Redis;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('redis.host')!;
    const port = this.config.get<number>('redis.port')!;
    this.client = new Redis({ host, port, maxRetriesPerRequest: null });
    this.subscriber = new Redis({ host, port, maxRetriesPerRequest: null });
  }

  get pub(): Redis {
    return this.client;
  }

  get sub(): Redis {
    return this.subscriber;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
    await this.subscriber.quit();
  }
}
