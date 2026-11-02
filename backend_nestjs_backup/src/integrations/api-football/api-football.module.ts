import { Module } from '@nestjs/common';
import { ApiFootballService } from './api-football.service';

@Module({
  providers: [ApiFootballService],
  exports: [ApiFootballService],
})
export class ApiFootballModule {}
