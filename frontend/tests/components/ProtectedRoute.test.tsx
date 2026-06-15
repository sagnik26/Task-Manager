import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "../../src/modules/auth/context/useAuth";
import { ProtectedRoute } from "../../src/shared/layouts/ProtectedRoute";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

vi.mock("../../src/modules/auth/context/useAuth.ts", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
    replaceMock.mockReset();
  });

  it("shows loading state while auth is bootstrapping", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isBootstrapped: false,
      user: null,
      permissions: null,
      bootstrap: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Secret content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Checking session…")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isBootstrapped: true,
      user: null,
      permissions: null,
      bootstrap: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Secret content</div>
      </ProtectedRoute>,
    );

    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });

  it("renders children for authenticated users", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isBootstrapped: true,
      user: {
        id: "user-1",
        name: "Ada",
        email: "ada@example.com",
        tenantId: "tenant-1",
        role: "admin",
        isActive: true,
      },
      permissions: null,
      bootstrap: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Secret content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });
});
