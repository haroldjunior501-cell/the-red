import { Module } from '@nestjs/common';
import { SportmonksService } from './sportmonks.service';

@Module({
  providers: [SportmonksService],
  exports: [SportmonksService],
})
export class SportmonksModule {}
