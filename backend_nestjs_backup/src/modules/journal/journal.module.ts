import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenAiModule } from '../../integrations/openai/openai.module';
import { UsersModule } from '../users/users.module';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([JournalEntry]),
    UsersModule,
    OpenAiModule,
  ],
  controllers: [JournalController],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalModule {}
