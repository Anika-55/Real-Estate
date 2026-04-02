import { Router } from "express";
import { healthRouter } from "./health.routes";
import { userRouter } from "./user.routes";
import { authRouter } from "./auth.routes";
import { propertyRouter } from "./property.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/properties", propertyRouter);

export { apiRouter };
