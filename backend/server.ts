import config from "./src/shared/config";
import logger from "./src/shared/config/logger";
import { getPool } from "./src/shared/db";
import app from "./src/app";

const { port } = config;

async function startServer() {
  try {
    const pool = getPool();
    await pool.query("SELECT 1");
    logger.info("Database connected");

    const server = app.listen(port, "0.0.0.0", () => {
      logger.info(`Server started on port ${port}`);
      logger.info(`Environment: ${config.node_env}`);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      server.close(async (err) => {
        if (err) {
          logger.error("Error closing HTTP server", err);
          process.exit(1);
        }

        logger.info("HTTP server closed");
        try {
          await pool.end();
          logger.info("Database pool closed, exiting");
          process.exit(0);
        } catch (error) {
          logger.error("Error closing database pool", error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception", error);
      gracefulShutdown("uncaughtException");
    });
    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Rejection", { reason });
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
