import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      ok: true,
      service: 'goalya-api',
      ts: new Date().toISOString(),
    };
  }
}
