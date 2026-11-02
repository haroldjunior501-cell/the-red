import { Controller, Get, Post } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Get()
  list() {
    return this.matches.list();
  }

  @Post('refresh')
  refresh() {
    return this.matches.refreshUpcoming();
  }
}
