/** 400 — body validation (e.g. Zod / AppError with `errors`). */
export type ApiValidationFailedBody = {
  error: "validation failed";
  fields: Record<string, string>;
};

export type ApiUnauthorizedBody = {
  error: "unauthorized";
};

export type ApiForbiddenBody = {
  error: "forbidden";
};

export type ApiNotFoundBody = {
  error: "not found";
};

/** Other operational errors (e.g. 409) — message from server. */
export type ApiOperationalErrorBody = {
  error: string;
};

export type ApiInternalErrorBody = {
  error: "internal server error";
};
