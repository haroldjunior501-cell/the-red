import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LIVE_CHANNEL } from '../common/constants/live-channel';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({
  namespace: '/live',
  cors: { origin: '*' },
})
export class LiveGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(LiveGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly redis: RedisService) {}

  afterInit(_server: Server): void {
    void this.redis.sub.subscribe(LIVE_CHANNEL, (err) => {
      if (err) this.logger.error('Redis subscribe error', err);
    });
    this.redis.sub.on('message', (channel, message) => {
      if (channel !== LIVE_CHANNEL) return;
      try {
        const parsed = JSON.parse(message) as Record<string, unknown>;
        this.server.emit('live:event', parsed);
      } catch {
        this.logger.warn('Invalid redis payload');
      }
    });
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected ${client.id}`);
  }
}
