import { Router } from "express";
import { healthController } from "../controllers/health.controller";
import { asyncHandler } from "../utils/async-handler";

const healthRouter = Router();

healthRouter.get("/", asyncHandler(healthController.check));

export { healthRouter };

