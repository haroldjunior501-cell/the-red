export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    user: process.env.DATABASE_USER ?? 'goalya',
    password: process.env.DATABASE_PASSWORD ?? 'goalya',
    name: process.env.DATABASE_NAME ?? 'goalya',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
  },
  apiFootball: {
    baseUrl: process.env.API_FOOTBALL_BASE_URL ?? 'https://v3.football.api-sports.io',
    apiKey: process.env.API_FOOTBALL_KEY ?? '',
  },
  sportmonks: {
    baseUrl: process.env.SPORTMONKS_BASE_URL ?? 'https://api.sportmonks.com/v3/football',
    token: process.env.SPORTMONKS_TOKEN ?? '',
  },
  cors: {
    origins: (process.env.CORS_ORIGINS ?? '*')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },
});
