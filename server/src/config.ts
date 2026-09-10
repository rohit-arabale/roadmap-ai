import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://roadmapai:roadmapai@localhost:5433/roadmapai',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-3.1-flash-lite',
  geminiBaseUrl: process.env.GEMINI_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta/models',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
} as const;

if (!process.env.DATABASE_URL) {
  console.warn('[config] DATABASE_URL not set, using default:', config.databaseUrl);
}
if (!config.geminiApiKey) {
  console.warn('[config] GEMINI_API_KEY not set - /api/chat will return 500 until configured');
}
console.log(`[config] Gemini model: ${config.geminiModel}`);
