import { Request, Response } from "express";
import { getHealthStatus } from "../services/health.service";
import { createResponse } from "../utils/api-response";

export const healthController = {
  check: async (_req: Request, res: Response): Promise<void> => {
    const health = await getHealthStatus();
    const statusCode = health.status === "ok" ? 200 : 503;
    res.status(statusCode).json(createResponse("Service health status", health));
  },
};

