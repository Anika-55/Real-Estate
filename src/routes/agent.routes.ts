import { Router } from "express";
import { UserRole } from "@prisma/client";
import { propertyController } from "../controllers/property.controller";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import { uploadPropertyImages } from "../middlewares/upload.middleware";
import { asyncHandler } from "../utils/async-handler";

const agentRouter = Router();

agentRouter.use(asyncHandler(protect), authorizeRoles(UserRole.AGENT));

agentRouter.get("/properties", asyncHandler(propertyController.getMine));
agentRouter.post("/properties", uploadPropertyImages, asyncHandler(propertyController.create));
agentRouter.put("/properties/:id", uploadPropertyImages, asyncHandler(propertyController.update));
agentRouter.delete("/properties/:id", asyncHandler(propertyController.remove));

export { agentRouter };
