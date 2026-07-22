import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Switch from "../Switch";

describe("Switch", () => {
  it("reflects the checked state via role and aria-checked, for accessibility", () => {
    render(<Switch checked={true} onChange={() => {}} label="Is moderator" />);
    const toggle = screen.getByRole("switch", { name: "Is moderator" });
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange with the inverse of the current value when clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch checked={false} onChange={onChange} label="Is observer" />);

    await user.click(screen.getByRole("switch", { name: "Is observer" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
