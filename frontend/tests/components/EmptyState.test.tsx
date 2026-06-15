import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "../../src/shared/ui/EmptyState";

describe("EmptyState", () => {
  it("renders title and optional description", () => {
    render(
      <EmptyState
        title="No tasks yet"
        description="Create your first task to get started."
      />,
    );

    expect(screen.getByRole("heading", { name: "No tasks yet" })).toBeInTheDocument();
    expect(screen.getByText("Create your first task to get started.")).toBeInTheDocument();
  });

  it("renders a router link action when actionHref is provided", () => {
    render(
      <MemoryRouter>
        <EmptyState title="No projects" actionLabel="Create project" actionHref="/projects/new" />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "Create project" });
    expect(link).toHaveAttribute("href", "/projects/new");
  });

  it("invokes onAction when button action is clicked", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <EmptyState title="No tasks" actionLabel="Add task" onAction={onAction} />,
    );

    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});
