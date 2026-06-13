import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import { correlationIdMiddleware } from "./middlewares/correlationId";
import { requestLogger } from "./middlewares/requestLogger";
import { errorHandler } from "./middlewares/errorHandler";

const createApp = (): Express => {
  const app = express();

  app.use(correlationIdMiddleware);
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Routes go here (before the error handler)

  app.use(errorHandler);

  return app;
};

export { createApp };
