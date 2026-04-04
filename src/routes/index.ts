import { Router } from "express";
import { healthRouter } from "./health.routes";
import { userRouter } from "./user.routes";
import { authRouter } from "./auth.routes";
import { propertyRouter } from "./property.routes";
import { bookingRouter } from "./booking.routes";
import { adminRouter } from "./admin.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/properties", propertyRouter);
apiRouter.use("/bookings", bookingRouter);
apiRouter.use("/admin", adminRouter);

export { apiRouter };
