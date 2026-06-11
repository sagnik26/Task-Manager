import type { AxiosError } from "axios";

import type { ApiError, BackendErrorBody, BackendFieldErrors } from "../../types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseBackendErrorBody(data: unknown): BackendErrorBody | null {
  if (!isObject(data)) return null;
  if (typeof data.error !== "string") return null;

  const fields = data.fields;
  if (fields !== undefined && !isObject(fields)) return { error: data.error };

  return data as BackendErrorBody;
}

export function toApiError(error: unknown): ApiError {
  const ax = error as AxiosError<unknown> | undefined;

  // Axios/network errors (no response)
  if (ax && ax.isAxiosError && !ax.response) {
    return { kind: "network", message: ax.message || "network error" };
  }

  const status = ax?.response?.status;
  const body = parseBackendErrorBody(ax?.response?.data);

  if (status === 400 && body?.error === "validation failed") {
    const fields =
      body && "fields" in body && body.fields && typeof body.fields === "object"
        ? (body.fields as BackendFieldErrors)
        : {};
    return {
      kind: "validation",
      status: 400,
      message: "validation failed",
      fields,
    };
  }

  if (status === 401)
    return { kind: "unauthorized", status: 401, message: "unauthorized" };
  if (status === 403)
    return { kind: "forbidden", status: 403, message: "forbidden" };
  if (status === 404)
    return { kind: "not_found", status: 404, message: "not found" };

  if (typeof status === "number") {
    return {
      kind: "http",
      status,
      message: body?.error || ax?.message || "request failed",
    };
  }

  return { kind: "unknown", message: "unknown error" };
}

