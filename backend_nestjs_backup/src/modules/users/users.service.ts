import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async upsertFromFirebase(
    firebaseUid: string,
    email?: string,
    displayName?: string,
  ): Promise<User> {
    let user = await this.users.findOne({ where: { firebaseUid } });
    if (!user) {
      user = this.users.create({ firebaseUid, email, displayName });
    } else {
      user.email = email ?? user.email;
      user.displayName = displayName ?? user.displayName;
    }
    return this.users.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
