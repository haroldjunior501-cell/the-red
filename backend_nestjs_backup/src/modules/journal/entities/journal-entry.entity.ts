import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.journalEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @Column({ nullable: true })
  matchExternalId?: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ nullable: true })
  emotionTag?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
