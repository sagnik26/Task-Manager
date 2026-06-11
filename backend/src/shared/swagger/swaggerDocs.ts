import type { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

import { openApiDocument } from "./openapi";

/**
 * Helmet's default CSP blocks inline scripts/styles used by Swagger UI.
 * Override only for `/api-docs` (this runs before `swaggerUi.serve`).
 */
function allowSwaggerCsp(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
    ].join("; "),
  );
  next();
}

export const swaggerDocsMiddleware = [
  allowSwaggerCsp,
  ...swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "TaskFlow API",
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "list",
      filter: true,
      tryItOutEnabled: true,
    },
  }),
];
