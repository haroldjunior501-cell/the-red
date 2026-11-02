import { Module } from '@nestjs/common';
import { RedisModule } from '../../redis/redis.module';
import { EventEngineService } from './event-engine.service';

@Module({
  imports: [RedisModule],
  providers: [EventEngineService],
  exports: [EventEngineService],
})
export class EventsModule {}
