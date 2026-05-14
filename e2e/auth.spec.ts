import { test, expect } from "./fixtures/auth";
import {
  emailInput,
  passwordInput,
  submitButton,
  gotoLoginPage,
  gotoHomePage,
  gotoUsersPage,
  login,
  logout,
  expectLoginPage,
  expectHomePage,
} from "./helpers/auth";

const {
  SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
} = process.env;

test.describe("Authentication", () => {
  // ─── Login ─────────────────────────────────────────────────────────────────

  test.describe("Login", () => {
    test.beforeEach(async ({ page }) => {
      await gotoLoginPage(page);
    });

    test("displays the login form", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "IDENTITY VERIFICATION" })
      ).toBeVisible();
      await expect(emailInput(page)).toBeVisible();
      await expect(passwordInput(page)).toBeVisible();
      await expect(submitButton(page)).toBeVisible();
    });

    test("has no sign-up option", async ({ page }) => {
      await expect(
        page.getByRole("link", { name: /sign.?up|register|create/i })
      ).not.toBeVisible();
      await expect(
        page.getByText(/sign up|register|create account/i)
      ).not.toBeVisible();
    });

    // ── Client-side validation ─────────────────────────────────────────────

    test("shows email error when the field is blurred empty", async ({
      page,
    }) => {
      await emailInput(page).focus();
      await emailInput(page).blur();
      await expect(page.getByText("Enter a valid email address")).toBeVisible();
    });

    test("shows email error for an invalid email format", async ({ page }) => {
      await emailInput(page).fill("notanemail");
      await emailInput(page).blur();
      await expect(page.getByText("Enter a valid email address")).toBeVisible();
    });

    test("shows password error when submitted without a password", async ({
      page,
    }) => {
      await emailInput(page).fill("admin@example.com");
      await submitButton(page).click();
      await expect(page.getByText("Access code is required")).toBeVisible();
    });

    test("shows both field errors when submitted empty", async ({ page }) => {
      await submitButton(page).click();
      await expect(page.getByText("Enter a valid email address")).toBeVisible();
      await expect(page.getByText("Access code is required")).toBeVisible();
    });

    test("clears email error once a valid email is entered", async ({
      page,
    }) => {
      await emailInput(page).fill("bad");
      await emailInput(page).blur();
      await expect(page.getByText("Enter a valid email address")).toBeVisible();

      await emailInput(page).fill("valid@example.com");
      await expect(
        page.getByText("Enter a valid email address")
      ).not.toBeVisible();
    });

    // ── Credentials ────────────────────────────────────────────────────────

    test("redirects to / on valid admin credentials", async ({ page }) => {
      await login(page, SEED_ADMIN_EMAIL!, SEED_ADMIN_PASSWORD!);
      await expectHomePage(page);
    });

    test("redirects to / on valid regular-user credentials", async ({
      page,
    }) => {
      await login(page, TEST_USER_EMAIL!, TEST_USER_PASSWORD!);
      await expectHomePage(page);
    });

    test("shows an error alert on a wrong password", async ({ page }) => {
      await emailInput(page).fill(SEED_ADMIN_EMAIL!);
      await passwordInput(page).fill("wrongpassword12345");
      await submitButton(page).click();
      await expect(page.getByRole("alert")).toBeVisible();
      await expectLoginPage(page);
    });

    test("shows an error alert for a non-existent email", async ({ page }) => {
      await emailInput(page).fill("nobody@example.com");
      await passwordInput(page).fill("password12345678");
      await submitButton(page).click();
      await expect(page.getByRole("alert")).toBeVisible();
      await expectLoginPage(page);
    });

    test("disables the submit button while authenticating", async ({
      page,
    }) => {
      await emailInput(page).fill(SEED_ADMIN_EMAIL!);
      await passwordInput(page).fill(SEED_ADMIN_PASSWORD!);

      // Hold the request open long enough to observe the in-flight disabled state.
      await page.route("**/api/auth/**", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await route.continue();
      });

      await submitButton(page).click();
      await expect(
        page.getByRole("button", { name: /AUTHENTICATING/i })
      ).toBeDisabled();
    });
  });

  // ─── Session persistence ────────────────────────────────────────────────────

  test.describe("Session persistence", () => {
    test("stays logged in after a full page reload", async ({
      adminPage: page,
    }) => {
      await page.reload();
      await expectHomePage(page);
    });

    test("navigating directly to / while authenticated lands on home page", async ({
      adminPage: page,
    }) => {
      await gotoHomePage(page);
      await expectHomePage(page);
    });
  });

  // ─── Protected routes — unauthenticated ─────────────────────────────────────

  test.describe("Protected routes — unauthenticated", () => {
    test("visiting / redirects to /login", async ({ page }) => {
      await gotoHomePage(page);
      await expectLoginPage(page);
    });

    test("visiting /users redirects to /login", async ({ page }) => {
      await gotoUsersPage(page);
      await expectLoginPage(page);
    });
  });

  // ─── Authorization — admin ──────────────────────────────────────────────────

  test.describe("Authorization — admin", () => {
    test("can access /users", async ({ adminPage: page }) => {
      await gotoUsersPage(page);
      await expect(page).toHaveURL("/users");
      await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    });

    test("sees the USERS nav link", async ({ adminPage: page }) => {
      await expect(page.getByRole("link", { name: "USERS" })).toBeVisible();
    });

    test("can still reach the /login page", async ({ adminPage: page }) => {
      await gotoLoginPage(page);
      await expect(
        page.getByRole("heading", { name: "IDENTITY VERIFICATION" })
      ).toBeVisible();
    });
  });

  // ─── Authorization — non-admin ──────────────────────────────────────────────

  test.describe("Authorization — non-admin", () => {
    test("visiting /users redirects to /", async ({ userPage: page }) => {
      await gotoUsersPage(page);
      await expectHomePage(page);
    });

    test("does not see the USERS nav link", async ({ userPage: page }) => {
      await expect(page.getByRole("link", { name: "USERS" })).not.toBeVisible();
    });
  });

  // ─── Sign out ───────────────────────────────────────────────────────────────

  test.describe("Sign out", () => {
    test("clicking SIGN OUT navigates to /login", async ({
      adminPage: page,
    }) => {
      await logout(page);
      await expectLoginPage(page);
    });

    test("after sign out, visiting / redirects to /login", async ({
      adminPage: page,
    }) => {
      await logout(page);
      await gotoHomePage(page);
      await expectLoginPage(page);
    });

    test("clears the session cookie", async ({ adminPage: page, context }) => {
      await logout(page);
      const cookies = await context.cookies();
      const sessionCookie = cookies.find((c) =>
        c.name.startsWith("better-auth")
      );
      expect(sessionCookie).toBeUndefined();
    });
  });
});
