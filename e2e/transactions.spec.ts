import { test, expect } from "./fixtures/auth";
import { gotoHomePage } from "./helpers/auth";
import {
  uniqueTransaction,
  createTransaction,
  descriptionInput,
  amountInput,
  transmitButton,
  editButtonFor,
  deleteButtonFor,
  rowFor,
  editDialog,
  editDescriptionInput,
  editAmountInput,
  editTypeSelect,
  editCategorySelect,
  editStatusSelect,
  saveButton,
  deleteDialog,
  confirmDeleteButton,
} from "./helpers/transactions";

test.describe("Transaction Management", () => {
  test.beforeEach(async ({ userPage: page }) => {
    await gotoHomePage(page);
  });

  // ─── Create ─────────────────────────────────────────────────────────────────

  test("creates a new transaction and shows it in the table", async ({
    userPage: page,
  }) => {
    const tx = uniqueTransaction();
    await createTransaction(page, tx);

    await expect(rowFor(page, tx.description)).toBeVisible();
  });

  test("resets the form after successful submission", async ({
    userPage: page,
  }) => {
    const tx = uniqueTransaction();
    await descriptionInput(page).fill(tx.description);
    await amountInput(page).fill(tx.amount);
    await transmitButton(page).click();

    await expect(descriptionInput(page)).toHaveValue("", { timeout: 10_000 });
  });

  // ─── Read / pre-population ───────────────────────────────────────────────────

  test("opens the edit dialog pre-populated with the transaction's values", async ({
    userPage: page,
  }) => {
    const tx = uniqueTransaction();
    await createTransaction(page, tx);

    await editButtonFor(page, tx.description).click();

    await expect(editDialog(page)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Edit Transaction" })
    ).toBeVisible();
    await expect(editDescriptionInput(page)).toHaveValue(tx.description);
    await expect(editAmountInput(page)).toHaveValue(tx.amount);
  });

  test("pre-selects operationType, category and status in the edit dialog", async ({
    userPage: page,
  }) => {
    const tx = uniqueTransaction();
    await createTransaction(page, tx);

    await editButtonFor(page, tx.description).click();

    // Defaults from the create form: Outflow + Food + Confirmed
    await expect(editTypeSelect(page)).toHaveValue("Outflow");
    await expect(editCategorySelect(page)).toHaveValue("Food");
    await expect(editStatusSelect(page)).toHaveValue("confirmed");
  });

  // ─── Update ─────────────────────────────────────────────────────────────────

  test("saves edited description and reflects the change in the table", async ({
    userPage: page,
  }) => {
    const tx = uniqueTransaction();
    await createTransaction(page, tx);

    await editButtonFor(page, tx.description).click();

    const updatedDescription = `${tx.description} (edited)`;
    await editDescriptionInput(page).fill(updatedDescription);
    await saveButton(page).click();

    await expect(editDialog(page)).not.toBeVisible();
    await expect(rowFor(page, updatedDescription)).toBeVisible();
    await expect(rowFor(page, tx.description)).not.toBeVisible();
  });

  test("saves edited amount and reflects the change in the table", async ({
    userPage: page,
  }) => {
    const tx = uniqueTransaction();
    await createTransaction(page, tx);

    await editButtonFor(page, tx.description).click();

    await editAmountInput(page).fill("99");
    await saveButton(page).click();

    await expect(editDialog(page)).not.toBeVisible();
    // Row still present; amount column shows the new value
    await expect(rowFor(page, tx.description)).toBeVisible();
    await expect(page.getByRole("cell", { name: /99\.00/ })).toBeVisible();
  });

  test("closes the edit dialog on CANCEL without saving changes", async ({
    userPage: page,
  }) => {
    const tx = uniqueTransaction();
    await createTransaction(page, tx);

    await editButtonFor(page, tx.description).click();
    await editDescriptionInput(page).fill("Should not be saved");
    await editDialog(page)
      .getByRole("button", { name: /cancel/i })
      .click();

    await expect(editDialog(page)).not.toBeVisible();
    // Original description still in the table
    await expect(rowFor(page, tx.description)).toBeVisible();
  });

  // ─── Delete ─────────────────────────────────────────────────────────────────

  test("shows the delete confirmation dialog when Delete is clicked", async ({
    userPage: page,
  }) => {
    const tx = uniqueTransaction();
    await createTransaction(page, tx);

    await deleteButtonFor(page, tx.description).click();

    await expect(deleteDialog(page)).toBeVisible();
    await expect(deleteDialog(page)).toContainText(tx.description);
  });

  test("deletes the transaction after confirmation and removes it from the table", async ({
    userPage: page,
  }) => {
    const tx = uniqueTransaction();
    await createTransaction(page, tx);

    await deleteButtonFor(page, tx.description).click();
    await confirmDeleteButton(page).click();

    await expect(deleteDialog(page)).not.toBeVisible();
    await expect(rowFor(page, tx.description)).not.toBeVisible();
  });

  test("keeps the transaction in the table when delete is cancelled", async ({
    userPage: page,
  }) => {
    const tx = uniqueTransaction();
    await createTransaction(page, tx);

    await deleteButtonFor(page, tx.description).click();
    await deleteDialog(page)
      .getByRole("button", { name: /cancel/i })
      .click();

    await expect(deleteDialog(page)).not.toBeVisible();
    await expect(rowFor(page, tx.description)).toBeVisible();
  });
});
