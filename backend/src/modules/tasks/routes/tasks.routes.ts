import { Router } from "express";

import authenticate from "../../../shared/middlewares/authenticate";
import validateRequest from "../../../shared/middlewares/validate";
import tasksDeps from "../dependencies/tasks.dependencies";
import { createTaskBodySchema, updateTaskBodySchema } from "../validators/tasks.validator";

const router = Router();
const { tasksController } = tasksDeps.controllers;

router.get("/projects/:id/tasks", authenticate, (req, res, next) => {
  void tasksController.listByProject(req, res, next);
});

router.post(
  "/projects/:id/tasks",
  authenticate,
  validateRequest(createTaskBodySchema),
  (req, res, next) => {
    void tasksController.createForProject(req, res, next);
  },
);

router.patch(
  "/tasks/:id",
  authenticate,
  validateRequest(updateTaskBodySchema),
  (req, res, next) => {
    void tasksController.update(req, res, next);
  },
);

router.delete("/tasks/:id", authenticate, (req, res, next) => {
  void tasksController.delete(req, res, next);
});

export default router;

