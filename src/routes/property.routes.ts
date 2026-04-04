import { Router } from "express";
import { UserRole } from "@prisma/client";
import { propertyController } from "../controllers/property.controller";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import { uploadPropertyImages } from "../middlewares/upload.middleware";
import { asyncHandler } from "../utils/async-handler";

const propertyRouter = Router();

propertyRouter.get("/", asyncHandler(propertyController.getAll));
propertyRouter.get("/:id", asyncHandler(propertyController.getOne));
propertyRouter.post(
  "/",
  asyncHandler(protect),
  authorizeRoles(UserRole.ADMIN, UserRole.AGENT),
  uploadPropertyImages,
  asyncHandler(propertyController.create)
);
propertyRouter.patch(
  "/:id",
  asyncHandler(protect),
  authorizeRoles(UserRole.ADMIN, UserRole.AGENT),
  uploadPropertyImages,
  asyncHandler(propertyController.update)
);
propertyRouter.delete(
  "/:id",
  asyncHandler(protect),
  authorizeRoles(UserRole.ADMIN, UserRole.AGENT),
  asyncHandler(propertyController.remove)
);

export { propertyRouter };
