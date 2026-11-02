import { Controller, Get } from '@nestjs/common';
import { LiveService } from './live.service';

@Controller('live')
export class LiveController {
  constructor(private readonly live: LiveService) {}

  @Get('snapshot')
  snapshot() {
    return this.live.snapshot();
  }
}
