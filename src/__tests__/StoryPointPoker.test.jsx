import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StoryPointPoker from "../StoryPointPoker";

/*
  Behavior test (not implementation detail): a person creating a room should see a real
  validation message for an invalid name, and should be able to proceed once it's fixed —
  exercised through the actual page component, not a mock.
*/
describe("Create room — name validation", () => {
  it("blocks a name that's too short and shows the real error message", async () => {
    const user = userEvent.setup();
    render(<StoryPointPoker />);

    await user.type(screen.getByPlaceholderText("Please enter your name"), "A");
    await user.click(screen.getByRole("button", { name: "Create room" }));

    expect(await screen.findByText("Name must be at least 2 characters")).toBeInTheDocument();
    // Should not have advanced past the create-room screen
    expect(screen.queryByText("Invite players to the room")).not.toBeInTheDocument();
  });

  it("clears the error once the person starts fixing the name", async () => {
    const user = userEvent.setup();
    render(<StoryPointPoker />);

    const input = screen.getByPlaceholderText("Please enter your name");
    await user.type(input, "A");
    await user.click(screen.getByRole("button", { name: "Create room" }));
    expect(await screen.findByText("Name must be at least 2 characters")).toBeInTheDocument();

    await user.type(input, "lex");
    expect(screen.queryByText("Name must be at least 2 characters")).not.toBeInTheDocument();
  });

  it("proceeds to the invite screen with a valid name", async () => {
    const user = userEvent.setup();
    render(<StoryPointPoker />);

    await user.type(screen.getByPlaceholderText("Please enter your name"), "Alex");
    await user.click(screen.getByRole("button", { name: "Create room" }));

    expect(await screen.findByText("Invite players to the room")).toBeInTheDocument();
  });

  it("rejects a name over the 30-character limit", async () => {
    const user = userEvent.setup();
    render(<StoryPointPoker />);

    // maxLength on the input means typing more than 30 chars is clipped at the DOM level —
    // this proves that clipping actually happens, not just that validateName() rejects it.
    const input = screen.getByPlaceholderText("Please enter your name");
    await user.type(input, "a".repeat(40));

    expect(input.value.length).toBe(30);
  });
});
