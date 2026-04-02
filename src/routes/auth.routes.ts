import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/async-handler";

const authRouter = Router();

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));
authRouter.post("/refresh-token", asyncHandler(authController.refreshToken));
authRouter.post("/logout", asyncHandler(authController.logout));

export { authRouter };

