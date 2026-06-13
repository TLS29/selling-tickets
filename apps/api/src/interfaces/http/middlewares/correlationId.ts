import type { Request, Response, NextFunction } from "express";
import { logger } from "#infrastructure/config/logger";
import { randomUUID } from "node:crypto";
import { RequestContext } from "#infrastructure/observability/requestContext";

const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const CORRELATION_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
  const incoming = req.header("x-correlation-id");

  let correlationId: string;

  if (incoming && CORRELATION_ID_PATTERN.test(incoming)) {
    correlationId = incoming;
  } else {
    if (incoming) {
      logger.warn(
        { incoming },
        "Invalid X-Correlation-Id header, generating new one",
      );
    }
    correlationId = randomUUID();
  }

  res.setHeader("x-correlation-id", correlationId);
  RequestContext.runWithContext({ correlationId }, () => {
    next();
  });
};

export { correlationIdMiddleware };
