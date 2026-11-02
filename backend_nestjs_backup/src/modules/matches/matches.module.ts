import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiFootballModule } from '../../integrations/api-football/api-football.module';
import { Match } from './entities/match.entity';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), ApiFootballModule],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
