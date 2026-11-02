import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenAiService } from '../../integrations/openai/openai.service';
import { UsersService } from '../users/users.service';
import { JournalEntry } from './entities/journal-entry.entity';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(JournalEntry)
    private readonly entries: Repository<JournalEntry>,
    private readonly users: UsersService,
    private readonly openai: OpenAiService,
  ) {}

  async listForUser(userId: string): Promise<JournalEntry[]> {
    await this.users.findById(userId);
    return this.entries.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async generateAutoEntry(
    userId: string,
    matchLabel: string,
    matchExternalId?: string,
  ): Promise<JournalEntry> {
    const user = await this.users.findById(userId);
    const content = await this.openai.generateJournalSnippet({ matchLabel });
    const entry = this.entries.create({
      user,
      userId: user.id,
      matchExternalId,
      content,
      emotionTag: 'immersion',
    });
    return this.entries.save(entry);
  }

  async getOne(id: string): Promise<JournalEntry> {
    const row = await this.entries.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Journal entry not found');
    return row;
  }
}
