import { createApp } from './app.js';
import { config } from './config.js';
import { connectDb, disconnectDb } from './db.js';

async function main(): Promise<void> {
  await connectDb();

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[server] Roadmap.ai API listening on http://localhost:${config.port}`);
    console.log(`[server] Health: http://localhost:${config.port}/api/health`);
    console.log(`[server] Gemini model: ${config.geminiModel}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[server] ${signal} shutting down...`);
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    console.error('[server] uncaughtException', err);
    shutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason) => {
    console.error('[server] unhandledRejection', reason);
  });
}

main().catch(async (err) => {
  console.error('[server] failed to start', err);
  await disconnectDb();
  process.exit(1);
});
