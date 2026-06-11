import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import config from "../config/index";
import logger from "../config/logger";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}

interface AccessTokenPayload extends jwt.JwtPayload {
  user_id: string;
  email: string;
}

function isAccessTokenPayload(
  decoded: string | jwt.JwtPayload,
): decoded is AccessTokenPayload {
  return (
    typeof decoded === "object" &&
    decoded !== null &&
    typeof (decoded as AccessTokenPayload).user_id === "string" &&
    typeof (decoded as AccessTokenPayload).email === "string"
  );
}

function readToken(req: Request): string | null {
  const cookies = (req as Request & { cookies?: Record<string, string> })
    .cookies;
  if (cookies?.token) {
    return cookies.token;
  }
  if (cookies?.authToken) {
    return cookies.authToken;
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const value = authHeader.slice("Bearer ".length).trim();
    if (value) return value;
  }

  return null;
}

/**
 * Middleware to authenticate requests using JWT (Bearer token or token/authToken cookie).
 */
const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = readToken(req);

    if (!token) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    if (!isAccessTokenPayload(decoded)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    req.user = {
      userId: decoded.user_id,
      email: decoded.email,
    };

    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const name = error instanceof Error ? error.name : "";

    logger.error("Authentication failed", {
      error: message,
      path: req.path,
    });

    if (name === "TokenExpiredError") {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    res.status(401).json({ error: "unauthorized" });
  }
};

export default authenticate;
