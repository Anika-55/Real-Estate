import { Router } from "express";
import { UserRole } from "@prisma/client";
import { bookingController } from "../controllers/booking.controller";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const bookingRouter = Router();

bookingRouter.post("/", asyncHandler(protect), asyncHandler(bookingController.create));
bookingRouter.delete("/:id", asyncHandler(protect), asyncHandler(bookingController.cancel));
bookingRouter.patch(
  "/:id/confirm",
  asyncHandler(protect),
  authorizeRoles(UserRole.ADMIN, UserRole.AGENT),
  asyncHandler(bookingController.confirm)
);
bookingRouter.get("/me", asyncHandler(protect), asyncHandler(bookingController.getMine));

export { bookingRouter };
