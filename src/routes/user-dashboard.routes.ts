import { Router } from "express";
import { userDashboardController } from "../controllers/user-dashboard.controller";
import { protect } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const userDashboardRouter = Router();

userDashboardRouter.use(asyncHandler(protect));

userDashboardRouter.get("/bookings", asyncHandler(userDashboardController.bookings));
userDashboardRouter.post("/favorites", asyncHandler(userDashboardController.saveFavorite));
userDashboardRouter.delete("/favorites/:propertyId", asyncHandler(userDashboardController.removeFavorite));
userDashboardRouter.get("/favorites", asyncHandler(userDashboardController.favorites));
userDashboardRouter.get("/profile", asyncHandler(userDashboardController.profile));
userDashboardRouter.patch("/profile", asyncHandler(userDashboardController.updateProfile));

export { userDashboardRouter };
