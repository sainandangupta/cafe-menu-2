/// <reference path="./types/express.d.ts" />
import server from './server';
import env from './config/environment';
import logger from './utils/logger';
import prisma from './config/database';

async function bootstrap() {
  try {
    // 1. Verify Database connectivity
    logger.info('Connecting to PostgreSQL database via Prisma...');
    await prisma.$connect();
    logger.info('Database connection established successfully!');

    // 2. Start HTTP server
    const port = env.PORT;
    server.listen(port, () => {
      logger.info(`🚀 QuickCafe Backend Service is running in "${env.NODE_ENV}" mode`);
      logger.info(`➜ Local: http://localhost:${port}/`);
    });
  } catch (err: any) {
    logger.error('Fatal initialization error:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Global process exception catches
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

bootstrap();
