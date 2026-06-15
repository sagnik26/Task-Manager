import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ErrorState } from "../../src/shared/ui/ErrorState";

describe("ErrorState", () => {
  it("renders the error heading and message", () => {
    render(<ErrorState message="Failed to load tasks." />);

    expect(screen.getByRole("heading", { name: "Error" })).toBeInTheDocument();
    expect(screen.getByText("Failed to load tasks.")).toBeInTheDocument();
  });

  it("renders the default message when none is provided", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  it("does not render an action button without onAction", () => {
    render(<ErrorState message="Oops" actionLabel="Retry" />);
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  it("invokes onAction when the retry button is clicked", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <ErrorState
        message="Network error."
        actionLabel="Retry"
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onAction).toHaveBeenCalledOnce();
  });
});
