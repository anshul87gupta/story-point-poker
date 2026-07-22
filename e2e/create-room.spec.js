import { test, expect } from "@playwright/test";

/*
  Covers the single most critical path end-to-end: create a room, move through the invite
  screen, cast a vote, and reveal estimates. Deliberately just this one flow for the MVP —
  broader coverage belongs at the unit/component level (see src/**\/__tests__), which is
  faster and cheaper to maintain than more E2E specs.
*/
test("create a room, vote, and reveal estimates", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Please enter your name").fill("Alex");
  await page.getByRole("button", { name: "Create room" }).click();

  await expect(page.getByText("Invite players to the room")).toBeVisible();

  await page.getByRole("button", { name: "Start estimating" }).click();

  await page.getByRole("button", { name: "5", exact: true }).click();
  await page.getByRole("button", { name: "Reveal estimates" }).click();

  await expect(page.getByText("Moderator Insights")).toBeVisible();
  await expect(page.getByText("Re-estimation Progress")).toBeVisible();
});

test("rejects a name that's too short before creating a room", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Please enter your name").fill("A");
  await page.getByRole("button", { name: "Create room" }).click();

  await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();
  await expect(page.getByText("Invite players to the room")).not.toBeVisible();
});
