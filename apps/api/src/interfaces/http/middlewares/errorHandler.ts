import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "#infrastructure/config/logger";
import { env } from "#infrastructure/config/env";
import { RequestContext } from "#infrastructure/observability/requestContext";

interface HttpErrorShape {
  statusCode?: unknown;
  status?: unknown;
  message?: unknown;
}

const resolveStatusCode = (err: HttpErrorShape): number => {
  if (typeof err.statusCode === "number") return err.statusCode;
  if (typeof err.status === "number") return err.status;
  return 500;
};

// All 4 params are required — Express identifies an error handler by its
// arity (err, req, res, next). It must be registered LAST, after the routes.
const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Response already started: we can't send a second one — let Express close it.
  if (res.headersSent) {
    next(err);
    return;
  }

  const correlationId = RequestContext.getContext()?.correlationId;

  // Zod validation errors → 400 with the list of issues. Safe to expose in any
  // env: the details describe the client's own invalid input.
  if (err instanceof ZodError) {
    logger.warn({ err }, "Validation error");
    res.status(400).json({
      error: {
        message: "Validation failed",
        statusCode: 400,
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
        correlationId,
      },
    });
    return;
  }

  // TODO(domain): map DomainError -> status via DOMAIN_STATUS[err.code] here,
  // before the generic fallback below.

  const error = (err ?? {}) as HttpErrorShape;
  const statusCode = resolveStatusCode(error);

  // correlationId is attached automatically by the pino mixin.
  if (statusCode >= 500) {
    logger.error({ err }, "Unhandled error");
  } else {
    logger.warn({ err }, "Request error");
  }

  // Expose client errors (4xx) freely; hide 5xx internals in production.
  const exposeMessage = statusCode < 500 || env.nodeEnv !== "production";
  const message =
    exposeMessage && typeof error.message === "string"
      ? error.message
      : "Internal Server Error";

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      correlationId,
    },
  });
};

export { errorHandler };
