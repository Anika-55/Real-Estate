import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { asyncHandler } from "../utils/async-handler";

const userRouter = Router();

userRouter.get("/", asyncHandler(userController.list));
userRouter.post("/", asyncHandler(userController.create));

export { userRouter };

