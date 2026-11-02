import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { LiveGateway } from './live.gateway';

@Module({
  imports: [RedisModule],
  providers: [LiveGateway],
  exports: [LiveGateway],
})
export class RealtimeModule {}
