import { test, expect } from "./fixtures/auth";
import { gotoUsersPage } from "./helpers/auth";
import {
  newUserButton,
  nameInput,
  emailInput,
  passwordInput,
  saveChangesSubmit,
  editButtonFor,
  deleteButtonFor,
  confirmDeleteButton,
  uniqueUser,
  createUser,
} from "./helpers/users";

test.describe("User Management", () => {
  test.beforeEach(async ({ adminPage: page }) => {
    await gotoUsersPage(page);
  });

  // ─── Create ─────────────────────────────────────────────────────────────────

  test("opens the New User form when New User button is clicked", async ({
    adminPage: page,
  }) => {
    await newUserButton(page).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "New User" })).toBeVisible();
  });

  test("creates a new user and shows them in the table", async ({
    adminPage: page,
  }) => {
    const user = uniqueUser();
    await createUser(page, user);

    await expect(
      page.getByRole("cell", { name: user.name, exact: true })
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: user.email })).toBeVisible();
  });

  // ─── Update ─────────────────────────────────────────────────────────────────

  test("opens the Edit User form pre-populated with user data", async ({
    adminPage: page,
  }) => {
    const user = uniqueUser();
    await createUser(page, user);

    await editButtonFor(page, user.name).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Edit User" })
    ).toBeVisible();
    await expect(nameInput(page)).toHaveValue(user.name);
    await expect(emailInput(page)).toHaveValue(user.email);
    await expect(passwordInput(page)).toHaveValue("");
  });

  test("saves updated user data and reflects changes in the table", async ({
    adminPage: page,
  }) => {
    const user = uniqueUser();
    await createUser(page, user);

    await editButtonFor(page, user.name).click();

    const updatedName = `${user.name} (edited)`;
    await nameInput(page).fill(updatedName);
    await saveChangesSubmit(page).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(
      page.getByRole("cell", { name: updatedName, exact: true })
    ).toBeVisible();
  });

  // ─── Delete ─────────────────────────────────────────────────────────────────

  test("shows a confirmation dialog when Delete button is clicked", async ({
    adminPage: page,
  }) => {
    const user = uniqueUser();
    await createUser(page, user);

    await deleteButtonFor(page, user.name).click();

    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expect(page.getByRole("alertdialog")).toContainText(user.name);
  });

  test("deletes the user after confirmation and removes from the table", async ({
    adminPage: page,
  }) => {
    const user = uniqueUser();
    await createUser(page, user);

    await deleteButtonFor(page, user.name).click();
    await confirmDeleteButton(page).click();

    await expect(page.getByRole("alertdialog")).not.toBeVisible();
    await expect(
      page.getByRole("cell", { name: user.name, exact: true })
    ).not.toBeVisible();
  });
});
