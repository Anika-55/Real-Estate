import { Router } from "express";
import { UserRole } from "@prisma/client";
import { userController } from "../controllers/user.controller";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const userRouter = Router();

userRouter.get("/", asyncHandler(protect), asyncHandler(userController.list));
userRouter.post("/", asyncHandler(protect), authorizeRoles(UserRole.ADMIN, UserRole.AGENT), asyncHandler(userController.create));

export { userRouter };
