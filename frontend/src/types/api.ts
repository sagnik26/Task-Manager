export type BackendFieldErrors = Record<string, string>;

export type BackendErrorBody =
  | { error: "validation failed"; fields: BackendFieldErrors }
  | { error: "unauthorized" }
  | { error: "forbidden" }
  | { error: "not found" }
  | { error: string; fields?: BackendFieldErrors };

export type ApiError =
  | {
      kind: "validation";
      status: 400;
      message: "validation failed";
      fields: BackendFieldErrors;
    }
  | { kind: "unauthorized"; status: 401; message: "unauthorized" }
  | { kind: "forbidden"; status: 403; message: "forbidden" }
  | { kind: "not_found"; status: 404; message: "not found" }
  | { kind: "http"; status: number; message: string }
  | { kind: "network"; message: string }
  | { kind: "unknown"; message: string };

export type BackendSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  statusCode: number;
};

