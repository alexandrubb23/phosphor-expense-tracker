import { test as base, type Page } from "@playwright/test";
import { login } from "../helpers/auth";

export { expect } from "@playwright/test";

type AuthFixtures = {
  /** Page pre-authenticated as the admin test user, landed on /. */
  adminPage: Page;
  /** Page pre-authenticated as the regular (non-admin) test user, landed on /. */
  userPage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ page }, use) => {
    await login(
      page,
      process.env.SEED_ADMIN_EMAIL!,
      process.env.SEED_ADMIN_PASSWORD!
    );
    await use(page);
  },

  userPage: async ({ page }, use) => {
    await login(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await use(page);
  },
});
