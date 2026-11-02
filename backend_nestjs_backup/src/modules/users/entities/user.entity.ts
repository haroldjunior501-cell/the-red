import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JournalEntry } from '../../journal/entities/journal-entry.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  firebaseUid!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ type: 'int', default: 1 })
  level!: number;

  @Column({ type: 'int', default: 0 })
  xp!: number;

  @OneToMany(() => JournalEntry, (j) => j.user)
  journalEntries!: JournalEntry[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
