import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import errorHandler from "./shared/middlewares/errorHandler";
import requestLogger from "./shared/middlewares/requestLogger";
import { swaggerDocsMiddleware } from "./shared/swagger/swaggerDocs";
import authRouter from "./modules/auth/routes/auth.routes";
import projectsRouter from "./modules/projects/routes/projects.routes";
import tasksRouter from "./modules/tasks/routes/tasks.routes";
import ResponseFormatter from "./shared/utils/responseFormatter";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json(
    ResponseFormatter.success(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      "Service is healthy",
    ),
  );
});

app.use("/api-docs", ...swaggerDocsMiddleware);

app.use("/auth", authRouter);
app.use("/projects", projectsRouter);
app.use(tasksRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "not found" });
});

app.use(errorHandler);

export default app;

