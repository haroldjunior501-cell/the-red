import { IsOptional, IsString } from 'class-validator';

export class UpsertUserDto {
  @IsString()
  firebaseUid!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}
