import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { Can } from "../../src/shared/permissions/Can";
import { useCan, usePermission } from "../../src/shared/permissions/usePermission";
import { useAuthStore } from "@/modules/auth/context/auth.store";
import type { PermissionFlags } from "@/modules/auth/types/auth.types";

function PermissionProbe({
  action,
  flag,
}: {
  action?: string;
  flag?: keyof PermissionFlags["can"];
}) {
  const allowedByAction = action ? usePermission(action) : false;
  const allowedByFlag = flag ? useCan(flag) : false;
  return (
    <div>
      {action ? <span data-testid="action">{String(allowedByAction)}</span> : null}
      {flag ? <span data-testid="flag">{String(allowedByFlag)}</span> : null}
    </div>
  );
}

const adminPermissions: PermissionFlags = {
  role: "admin",
  permissions: ["create:project", "manage:users"],
  can: {
    createProject: true,
    deleteProject: true,
    updateProject: true,
    viewProject: true,
    manageProjectMembers: true,
    manageUsers: true,
    createTask: true,
    updateTask: true,
    viewTask: true,
    deleteTask: true,
  },
};

describe("permissions", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, permissions: null });
  });

  it("usePermission returns true when action is granted", () => {
    useAuthStore.setState({ permissions: adminPermissions });

    render(<PermissionProbe action="create:project" />);
    expect(screen.getByTestId("action")).toHaveTextContent("true");
  });

  it("useCan reads boolean flags from the auth store", () => {
    useAuthStore.setState({ permissions: adminPermissions });

    render(<PermissionProbe flag="manageUsers" />);
    expect(screen.getByTestId("flag")).toHaveTextContent("true");
  });

  it("returns false when permissions are missing", () => {
    render(
      <>
        <PermissionProbe action="create:project" />
        <PermissionProbe flag="manageUsers" />
      </>,
    );

    expect(screen.getAllByTestId("action")[0]).toHaveTextContent("false");
    expect(screen.getAllByTestId("flag")[0]).toHaveTextContent("false");
  });
});

describe("Can", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, permissions: null });
  });

  it("renders children when permission is granted", () => {
    useAuthStore.setState({ permissions: adminPermissions });

    render(
      <Can permission="createProject">
        <button type="button">Create</button>
      </Can>,
    );

    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("renders fallback when permission is denied", () => {
    render(
      <Can permission="manageUsers" fallback={<span>Denied</span>}>
        <button type="button">Manage users</button>
      </Can>,
    );

    expect(screen.queryByRole("button", { name: "Manage users" })).not.toBeInTheDocument();
    expect(screen.getByText("Denied")).toBeInTheDocument();
  });
});
