import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiFootballService } from '../../integrations/api-football/api-football.service';
import { Match } from './entities/match.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
    private readonly apiFootball: ApiFootballService,
  ) {}

  async refreshUpcoming(): Promise<Match[]> {
    const fixtures = await this.apiFootball.listUpcomingFixtures(10);
    const saved: Match[] = [];
    for (const f of fixtures) {
      let row = await this.matches.findOne({ where: { externalId: f.externalId } });
      if (!row) {
        row = this.matches.create({
          externalId: f.externalId,
          homeTeam: f.homeTeam,
          awayTeam: f.awayTeam,
          kickoffAt: new Date(f.kickoffAt),
          status: f.status,
        });
      } else {
        row.homeTeam = f.homeTeam;
        row.awayTeam = f.awayTeam;
        row.kickoffAt = new Date(f.kickoffAt);
        row.status = f.status;
      }
      saved.push(await this.matches.save(row));
    }
    return saved;
  }

  async list(): Promise<Match[]> {
    return this.matches.find({ order: { kickoffAt: 'ASC' } });
  }
}
