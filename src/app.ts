import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { requestIdMiddleware } from "./middlewares/request-id.middleware";
import { apiRouter } from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(",").map((origin) => origin.trim()),
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "RealState backend is running",
  });
});

app.use("/api/v1", apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
