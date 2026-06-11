import { Router } from "express";

import authenticate from "../../../shared/middlewares/authenticate";
import validateRequest from "../../../shared/middlewares/validate";
import projectsDeps from "../dependencies/projects.dependencies";
import {
  createProjectBodySchema,
  updateProjectBodySchema,
} from "../validators/projects.validator";

const router = Router();
const { projectsController } = projectsDeps.controllers;

router.get("/", authenticate, (req, res, next) => {
  void projectsController.listProjects(req, res, next);
});

router.post(
  "/",
  authenticate,
  validateRequest(createProjectBodySchema),
  (req, res, next) => {
    void projectsController.createProject(req, res, next);
  },
);

router.get("/:id/stats", authenticate, (req, res, next) => {
  void projectsController.getProjectStats(req, res, next);
});

router.get("/:id", authenticate, (req, res, next) => {
  void projectsController.getProjectDetail(req, res, next);
});

router.patch(
  "/:id",
  authenticate,
  validateRequest(updateProjectBodySchema),
  (req, res, next) => {
    void projectsController.updateProject(req, res, next);
  },
);

router.delete("/:id", authenticate, (req, res, next) => {
  void projectsController.deleteProject(req, res, next);
});

export default router;

