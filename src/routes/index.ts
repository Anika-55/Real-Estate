import { Router } from "express";
import { healthRouter } from "./health.routes";
import { userRouter } from "./user.routes";
import { authRouter } from "./auth.routes";
import { propertyRouter } from "./property.routes";
import { bookingRouter } from "./booking.routes";
import { adminRouter } from "./admin.routes";
import { userDashboardRouter } from "./user-dashboard.routes";
import { agentRouter } from "./agent.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/properties", propertyRouter);
apiRouter.use("/bookings", bookingRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/user", userDashboardRouter);
apiRouter.use("/agent", agentRouter);

export { apiRouter };
