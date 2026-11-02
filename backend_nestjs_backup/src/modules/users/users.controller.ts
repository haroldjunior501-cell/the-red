import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UpsertUserDto } from './dto/upsert-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post('sync')
  sync(@Body() body: UpsertUserDto) {
    return this.users.upsertFromFirebase(
      body.firebaseUid,
      body.email,
      body.displayName,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findById(id);
  }
}
