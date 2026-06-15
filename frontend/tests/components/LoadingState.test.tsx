import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingState } from "../../src/shared/ui/LoadingState";

describe("LoadingState", () => {
  it("renders the default loading label", () => {
    render(<LoadingState />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(<LoadingState label="Checking session…" />);
    expect(screen.getByText("Checking session…")).toBeInTheDocument();
  });
});
