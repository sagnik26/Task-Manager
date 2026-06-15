import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "../../src/shared/ui/Avatar";

describe("Avatar", () => {
  it("renders initials and title from the user name", () => {
    render(<Avatar name="Ada Lovelace" />);

    const avatar = screen.getByTitle("Ada Lovelace");
    expect(avatar).toHaveTextContent("AL");
    expect(avatar).toHaveClass("avatar");
  });

  it("uses the seed for color selection when provided", () => {
    const { container, rerender } = render(<Avatar name="Display Name" seed="user-42" />);
    const firstBg = container.querySelector(".avatar")?.getAttribute("style");

    rerender(<Avatar name="Different Name" seed="user-42" />);
    const secondBg = container.querySelector(".avatar")?.getAttribute("style");

    expect(firstBg).toBe(secondBg);
  });

  it("applies size-based font sizing", () => {
    const { container } = render(<Avatar name="Ada Lovelace" size={22} />);
    const avatar = container.querySelector(".avatar") as HTMLElement;
    expect(avatar.style.width).toBe("22px");
    expect(avatar.style.fontSize).toBe("8px");
  });
});
