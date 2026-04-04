import { Router } from "express";
import { UserRole } from "@prisma/client";
import { adminController } from "../controllers/admin.controller";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const adminRouter = Router();

adminRouter.use(asyncHandler(protect), authorizeRoles(UserRole.ADMIN));

adminRouter.get("/users", asyncHandler(adminController.users));
adminRouter.delete("/users/:id", asyncHandler(adminController.deleteUser));
adminRouter.patch("/users/:id/role", asyncHandler(adminController.updateUserRole));
adminRouter.get("/properties", asyncHandler(adminController.properties));
adminRouter.get("/bookings", asyncHandler(adminController.bookings));

export { adminRouter };
