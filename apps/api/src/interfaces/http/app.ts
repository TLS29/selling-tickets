import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import { correlationIdMiddleware } from "./middlewares/correlationId";
import { requestLogger } from "./middlewares/requestLogger";

const createApp = (): Express => {
  const app = express();

  app.use(correlationIdMiddleware);
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  return app;
};

export { createApp };
