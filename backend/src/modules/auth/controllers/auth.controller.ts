import type { NextFunction, Request, Response } from "express";

import config from "../../../shared/config";
import ResponseFormatter from "../../../shared/utils/responseFormatter";
import type { AuthService } from "../services/auth.service";
import type { LoginBody, RegisterBody } from "../validators/auth.validator";

export class AuthController {
  constructor(private readonly authService: AuthService) {
    if (!authService) {
      throw new Error("AuthService is required");
    }
  }

  private setAuthCookie(res: Response, token: string): void {
    res.cookie("authToken", token, {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      maxAge: config.cookie.expiresIn,
    });
  }

  private clearAuthCookie(res: Response): void {
    res.clearCookie("authToken", {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
    });
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, email, password } = req.body as RegisterBody;
      const result = await this.authService.register({
        name,
        email,
        password,
      });
      this.setAuthCookie(res, result.token);
      res
        .status(201)
        .json(
          ResponseFormatter.success(
            result,
            "User registered successfully",
            201,
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginBody;
      const result = await this.authService.login(email, password);
      this.setAuthCookie(res, result.token);
      res
        .status(200)
        .json(ResponseFormatter.success(result, "Login successful"));
    } catch (error) {
      next(error);
    }
  }

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const profile = await this.authService.getProfile(userId);
      res.status(200).json(ResponseFormatter.success(profile, "Profile fetched"));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.clearAuthCookie(res);
      res.status(200).json(ResponseFormatter.success(null, "Logout successful"));
    } catch (error) {
      next(error);
    }
  }
}
