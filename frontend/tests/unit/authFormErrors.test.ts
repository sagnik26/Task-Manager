import { describe, expect, it, vi } from "vitest";

import { handleAuthFormError } from "../../src/shared/utils/authFormErrors";

function axiosError(status: number, data?: unknown) {
  return {
    isAxiosError: true,
    message: "Request failed",
    response: { status, data },
  };
}

describe("handleAuthFormError", () => {
  const allowedFieldKeys = ["email", "password", "name"] as const;

  it("maps validation errors to allowed field keys only", () => {
    const setFieldErrors = vi.fn();
    const setFormError = vi.fn();

    handleAuthFormError({
      error: axiosError(400, {
        error: "validation failed",
        fields: {
          email: "invalid email",
          password: "too short",
          unknown: "ignored",
        },
      }),
      allowedFieldKeys,
      setFieldErrors,
      setFormError,
      defaultMessage: "Something went wrong",
    });

    expect(setFieldErrors).toHaveBeenCalledWith({
      email: "invalid email",
      password: "too short",
    });
    expect(setFormError).not.toHaveBeenCalled();
  });

  it("sets unauthorized message on 401", () => {
    const setFieldErrors = vi.fn();
    const setFormError = vi.fn();

    handleAuthFormError({
      error: axiosError(401),
      allowedFieldKeys,
      setFieldErrors,
      setFormError,
      unauthorizedMessage: "Invalid credentials",
      defaultMessage: "Something went wrong",
    });

    expect(setFormError).toHaveBeenCalledWith("Invalid credentials");
    expect(setFieldErrors).not.toHaveBeenCalled();
  });

  it("sets conflict message on 409", () => {
    const setFieldErrors = vi.fn();
    const setFormError = vi.fn();

    handleAuthFormError({
      error: axiosError(409, { error: "email already registered" }),
      allowedFieldKeys,
      setFieldErrors,
      setFormError,
      conflictMessage: "Account already exists",
      defaultMessage: "Something went wrong",
    });

    expect(setFormError).toHaveBeenCalledWith("Account already exists");
  });

  it("falls back to api error message or default", () => {
    const setFieldErrors = vi.fn();
    const setFormError = vi.fn();

    handleAuthFormError({
      error: axiosError(500, { error: "server exploded" }),
      allowedFieldKeys,
      setFieldErrors,
      setFormError,
      defaultMessage: "Something went wrong",
    });

    expect(setFormError).toHaveBeenCalledWith("server exploded");
  });
});
