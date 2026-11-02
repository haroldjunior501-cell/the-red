import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Identifiant API-Football ou équivalent */
  @Column({ unique: true })
  externalId!: string;

  @Column()
  homeTeam!: string;

  @Column()
  awayTeam!: string;

  @Column({ type: 'timestamptz' })
  kickoffAt!: Date;

  @Column({ default: 'scheduled' })
  status!: string;

  @Column({ type: 'jsonb', nullable: true })
  rawPayload?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}
