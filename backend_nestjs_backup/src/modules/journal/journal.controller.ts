import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GenerateJournalDto } from './dto/generate-journal.dto';
import { JournalService } from './journal.service';

@Controller('journal')
export class JournalController {
  constructor(private readonly journal: JournalService) {}

  @Get('user/:userId')
  listByUser(@Param('userId') userId: string) {
    return this.journal.listForUser(userId);
  }

  @Post('generate')
  generate(@Body() body: GenerateJournalDto) {
    return this.journal.generateAutoEntry(
      body.userId,
      body.matchLabel,
      body.matchExternalId,
    );
  }
}
