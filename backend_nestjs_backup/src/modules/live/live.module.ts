import { Module } from '@nestjs/common';
import { SportmonksModule } from '../../integrations/sportmonks/sportmonks.module';
import { EventsModule } from '../events/events.module';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';

@Module({
  imports: [SportmonksModule, EventsModule],
  controllers: [LiveController],
  providers: [LiveService],
})
export class LiveModule {}
