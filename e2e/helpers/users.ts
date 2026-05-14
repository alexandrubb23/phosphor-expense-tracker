import { expect, type Page } from "@playwright/test";

// ── Locators ──────────────────────────────────────────────────────────────────

export const newUserButton = (page: Page) =>
  page.getByRole("button", { name: "▸ New User" });

/** Scoped to the open dialog to avoid clashing with login-page inputs. */
export const nameInput = (page: Page) =>
  page.getByRole("dialog").getByLabel("NAME");

/** Scoped to the open dialog to avoid clashing with login-page inputs. */
export const emailInput = (page: Page) =>
  page.getByRole("dialog").getByLabel("EMAIL ADDRESS");

/** Scoped to the open dialog to avoid clashing with login-page inputs. */
export const passwordInput = (page: Page) =>
  page.getByRole("dialog").getByLabel("PASSWORD");

export const createUserSubmit = (page: Page) =>
  page.getByRole("button", { name: "▸ CREATE USER" });

export const saveChangesSubmit = (page: Page) =>
  page.getByRole("button", { name: "▸ SAVE CHANGES" });

export const editButtonFor = (page: Page, name: string) =>
  page.getByRole("button", { name: `Edit ${name}` });

export const deleteButtonFor = (page: Page, name: string) =>
  page.getByRole("button", { name: `Delete ${name}` });

export const confirmDeleteButton = (page: Page) =>
  page.getByRole("alertdialog").getByRole("button", { name: "▸ DELETE" });

// ── Data factories ─────────────────────────────────────────────────────────────

/** Returns a unique { name, email, password } object for each call. */
export function uniqueUser() {
  const suffix =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  return {
    name: `Test User ${suffix}`,
    email: `testuser.${suffix}@example.com`,
    password: "Password123!",
  };
}

// ── Action helpers ─────────────────────────────────────────────────────────────

/**
 * Creates a new user through the UI form.
 * Assumes the page is already on `/users`.
 * Waits for the dialog to close and the new user's name to appear in the table.
 */
export async function createUser(
  page: Page,
  data: { name: string; email: string; password: string }
) {
  await newUserButton(page).click();
  await nameInput(page).fill(data.name);
  await emailInput(page).fill(data.email);
  await passwordInput(page).fill(data.password);
  await createUserSubmit(page).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("cell", { name: data.name, exact: true })
  ).toBeVisible();
}
