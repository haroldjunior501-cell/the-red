import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

/**
 * Nécessite PostgreSQL + Redis (ex. `docker compose up -d` à la racine GOALYA).
 */
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    jest.setTimeout(120_000);
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
      }),
    );
    await app.init();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.ok).toBe(true);
        expect(res.body.service).toBe('goalya-api');
      });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});
