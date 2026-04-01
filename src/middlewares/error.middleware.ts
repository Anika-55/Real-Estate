import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/api-error";

export const errorMiddleware = (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
  let statusCode = 500;
  let message = "Internal server error";

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    message = "Database operation failed";
  } else if (error instanceof Error) {
    message = error.message;
  }

  logger.error("Request failed", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: error instanceof Error ? error.stack : error,
  });

  res.status(statusCode).json({
    success: false,
    message,
    requestId: req.requestId,
    ...(env.nodeEnv !== "production" && error instanceof Error ? { stack: error.stack } : {}),
  });
};

