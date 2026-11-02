import { IsOptional, IsString, IsUUID } from 'class-validator';

export class GenerateJournalDto {
  @IsUUID()
  userId!: string;

  @IsString()
  matchLabel!: string;

  @IsOptional()
  @IsString()
  matchExternalId?: string;
}
