import type { BackendSuccessResponse } from "../../types";

export function extractResponseData<T>(payload: unknown): T {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    (payload as { success?: unknown }).success === true &&
    "data" in payload
  ) {
    return (payload as BackendSuccessResponse<T>).data;
  }
  // Some endpoints might return raw data (or you may call non-standard APIs).
  return payload as T;
}

