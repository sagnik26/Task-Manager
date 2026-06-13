import { Router } from "express";

import authenticate from "../../../shared/middlewares/authenticate";
import authorize from "../../../shared/middlewares/authorize";
import validateRequest from "../../../shared/middlewares/validate";
import usersDeps from "../dependencies/users.dependencies";
import { updateUserBodySchema } from "../validators/users.validator";

const router = Router();
const { usersController } = usersDeps.controllers;

router.get("/", authenticate, authorize("manage:users"), (req, res, next) => {
  void usersController.listUsers(req, res, next);
});

router.patch(
  "/:id",
  authenticate,
  authorize("manage:users"),
  validateRequest(updateUserBodySchema),
  (req, res, next) => {
    void usersController.updateUser(req, res, next);
  },
);

export default router;
