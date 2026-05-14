import { expect, type Page } from "@playwright/test";

// ── Locators ──────────────────────────────────────────────────────────────────

export const emailInput = (page: Page) => page.getByLabel("EMAIL ADDRESS");
export const passwordInput = (page: Page) => page.getByLabel("ACCESS CODE");
export const submitButton = (page: Page) =>
  page.getByRole("button", { name: "AUTHENTICATE" });
export const signOutButton = (page: Page) =>
  page.getByRole("button", { name: "SIGN OUT" });

// ── Actions ───────────────────────────────────────────────────────────────────

// ── Navigation ────────────────────────────────────────────────────────────────

export async function gotoPage(page: Page, path: string) {
  await page.goto(path);
}

export async function gotoLoginPage(page: Page) {
  await gotoPage(page, "/login");
}

export async function gotoHomePage(page: Page) {
  await gotoPage(page, "/");
}

export async function gotoUsersPage(page: Page) {
  await gotoPage(page, "/users");
}

export async function login(page: Page, email: string, password: string) {
  await gotoLoginPage(page);
  await emailInput(page).fill(email);
  await passwordInput(page).fill(password);
  await submitButton(page).click();
  await page.waitForURL("/");
}

export async function logout(page: Page) {
  await signOutButton(page).click();
  await page.waitForURL("/login");
}

// ── Assertions ────────────────────────────────────────────────────────────────

export async function expectLoginPage(page: Page) {
  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: "IDENTITY VERIFICATION" })
  ).toBeVisible();
}

export async function expectHomePage(page: Page) {
  await expect(page).toHaveURL("/");
  await expect(signOutButton(page)).toBeVisible();
}
