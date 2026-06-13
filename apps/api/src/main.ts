import { createApp } from "#interfaces/http/app";
import { logger } from "#infrastructure/config/logger";

const app = createApp();
const PORT = process.env.PORT ?? 3000;

const server = app.listen(PORT, () => {
  logger.info(`API running on http://localhost:${PORT}`);
});

const SHUTDOWN_TIMEOUT_MS = 10_000;
let shuttingDown = false;

const shutdown = (signal: string): void => {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "Shutting down gracefully");

  // Stop accepting new connections; the callback fires once in-flight requests finish.
  server.close((err) => {
    if (err) {
      logger.error({ err }, "Error during server close");
      process.exit(1);
    }
    logger.info("Server closed, exiting");
    // TODO: release other resources here (e.g. await prisma.$disconnect()).
    process.exit(0);
  });

  // Drop idle keep-alive sockets so close() doesn't wait on them.
  server.closeIdleConnections();

  // Hard cap: if connections don't drain in time, force exit.
  setTimeout(() => {
    logger.error("Forced shutdown: timed out waiting for connections to drain");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
