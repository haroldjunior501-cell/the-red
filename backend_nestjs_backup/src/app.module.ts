import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { ApiFootballModule } from './integrations/api-football/api-football.module';
import { OpenAiModule } from './integrations/openai/openai.module';
import { SportmonksModule } from './integrations/sportmonks/sportmonks.module';
import { JournalEntry } from './modules/journal/entities/journal-entry.entity';
import { JournalModule } from './modules/journal/journal.module';
import { Match } from './modules/matches/entities/match.entity';
import { MatchesModule } from './modules/matches/matches.module';
import { EventsModule } from './modules/events/events.module';
import { LiveModule } from './modules/live/live.module';
import { User } from './modules/users/entities/user.entity';
import { UsersModule } from './modules/users/users.module';
import { RedisModule } from './redis/redis.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.user'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        entities: [User, Match, JournalEntry],
        synchronize: config.get<string>('env') !== 'production',
        logging: config.get<string>('env') === 'development',
      }),
    }),
    RedisModule,
    ApiFootballModule,
    SportmonksModule,
    OpenAiModule,
    UsersModule,
    MatchesModule,
    JournalModule,
    EventsModule,
    LiveModule,
    RealtimeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
