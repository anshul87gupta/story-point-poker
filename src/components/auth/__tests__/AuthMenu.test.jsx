import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthMenu from "../AuthMenu";
import { translations } from "../../../i18n/translations";

const t = translations.en;

function mockFetchSequence(responses) {
  let call = 0;
  global.fetch = vi.fn(() => {
    const res = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return Promise.resolve({
      ok: res.ok,
      json: () => Promise.resolve(res.body),
    });
  });
}

// The header's profile toggle button and the "Sign In" menu option / submit button all
// share the accessible name "Sign In" — getByRole alone is ambiguous once the menu is
// open, so this always targets the last (most recently rendered / most specific) match.
function clickLast(name) {
  const matches = screen.getAllByRole("button", { name });
  return userEvent.setup().click(matches[matches.length - 1]);
}

describe("AuthMenu", () => {
  beforeEach(() => {
    document.cookie = "";
  });

  it("checks for an existing session on mount, and shows Sign In/Sign Up when signed out", async () => {
    mockFetchSequence([{ ok: false, body: { message: "Unauthenticated." } }]);
    const user = userEvent.setup();
    render(<AuthMenu t={t} />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole("button", { name: t.signIn })); // the toggle — unambiguous while menu is closed

    expect(screen.getByRole("button", { name: t.signUp })).toBeInTheDocument();
  });

  it("shows the real signed-in user after a successful login, not just a local mock", async () => {
    mockFetchSequence([
      { ok: false, body: { message: "Unauthenticated." } }, // initial session check on mount
      { ok: true, body: {} }, // csrf-cookie call
      { ok: true, body: { user: { id: 1, name: "Alex", email: "alex@example.com" } } }, // login
    ]);
    const user = userEvent.setup();
    render(<AuthMenu t={t} />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: t.signIn })); // open menu
    await clickLast(t.signIn); // click the "Sign In" menu option to switch to the form
    await user.type(screen.getByPlaceholderText(t.email), "alex@example.com");
    await user.type(screen.getByPlaceholderText(t.password), "password123");
    await clickLast(t.signIn); // submit the form

    expect(await screen.findByText("alex@example.com")).toBeInTheDocument();
    expect(screen.getByText("Alex")).toBeInTheDocument();
  });

  it("shows the server's validation error message on a failed login", async () => {
    mockFetchSequence([
      { ok: false, body: { message: "Unauthenticated." } },
      { ok: true, body: {} },
      { ok: false, body: { message: "The given data was invalid.", errors: { email: ["These credentials do not match our records."] } } },
    ]);
    const user = userEvent.setup();
    render(<AuthMenu t={t} />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: t.signIn }));
    await clickLast(t.signIn);
    await user.type(screen.getByPlaceholderText(t.email), "alex@example.com");
    await user.type(screen.getByPlaceholderText(t.password), "wrong");
    await clickLast(t.signIn);

    expect(await screen.findByText("These credentials do not match our records.")).toBeInTheDocument();
  });
});
