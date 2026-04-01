import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}. Closing server...`);
  await prisma.$disconnect();
  process.exit(0);
};

const server = app.listen(env.port, () => {
  logger.info(`Server running on port ${env.port}`, { environment: env.nodeEnv });
});

process.on("SIGINT", async () => {
  server.close(async () => {
    await gracefulShutdown("SIGINT");
  });
});

process.on("SIGTERM", async () => {
  server.close(async () => {
    await gracefulShutdown("SIGTERM");
  });
});

