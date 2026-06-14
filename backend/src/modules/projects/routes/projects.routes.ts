import { Router } from "express";

import authenticate from "../../../shared/middlewares/authenticate";
import authorize from "../../../shared/middlewares/authorize";
import validateRequest from "../../../shared/middlewares/validate";
import projectsDeps from "../dependencies/projects.dependencies";
import {
  addProjectMemberBodySchema,
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
  authorize("create:project"),
  validateRequest(createProjectBodySchema),
  (req, res, next) => {
    void projectsController.createProject(req, res, next);
  },
);

router.get("/:id/stats", authenticate, (req, res, next) => {
  void projectsController.getProjectStats(req, res, next);
});

router.get("/:id/members", authenticate, (req, res, next) => {
  void projectsController.listProjectMembers(req, res, next);
});

router.post(
  "/:id/members",
  authenticate,
  authorize("manage:project_members"),
  validateRequest(addProjectMemberBodySchema),
  (req, res, next) => {
    void projectsController.addProjectMember(req, res, next);
  },
);

router.delete(
  "/:id/members/:userId",
  authenticate,
  authorize("manage:project_members"),
  (req, res, next) => {
    void projectsController.removeProjectMember(req, res, next);
  },
);

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

router.delete(
  "/:id",
  authenticate,
  authorize("delete:project"),
  (req, res, next) => {
    void projectsController.deleteProject(req, res, next);
  },
);

export default router;
