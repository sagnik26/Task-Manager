import { Router } from "express";

import authenticate from "../../../shared/middlewares/authenticate";
import validateRequest from "../../../shared/middlewares/validate";
import authDeps from "../dependencies/auth.dependencies";
import { loginBodySchema, registerBodySchema } from "../validators/auth.validator";

const router = Router();
const { authController } = authDeps.controllers;

router.post(
  "/register",
  validateRequest(registerBodySchema),
  (req, res, next) => {
    void authController.register(req, res, next);
  },
);

router.post("/login", validateRequest(loginBodySchema), (req, res, next) => {
  void authController.login(req, res, next);
});

router.get("/profile", authenticate, (req, res, next) => {
  void authController.getProfile(req, res, next);
});

router.post("/logout", (req, res, next) => {
  void authController.logout(req, res, next);
});

export default router;
