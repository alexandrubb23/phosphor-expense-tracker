import { expect, type Page } from "@playwright/test";

// ── Create form locators (home page) ─────────────────────────────────────────

export const descriptionInput = (page: Page) =>
  page.getByPlaceholder("▸ describe entry");

export const amountInput = (page: Page) => page.getByPlaceholder("▸ amount");

export const transmitButton = (page: Page) =>
  page.getByRole("button", { name: "▸ Transmit" });

// ── Edit dialog locators ──────────────────────────────────────────────────────

export const editDialog = (page: Page) => page.getByRole("dialog");

export const editDescriptionInput = (page: Page) =>
  editDialog(page).locator('input[name="description"]');

export const editAmountInput = (page: Page) =>
  editDialog(page).locator('input[name="amount"]');

export const editTypeSelect = (page: Page) =>
  editDialog(page).locator('select[name="operationType"]');

export const editCategorySelect = (page: Page) =>
  editDialog(page).locator('select[name="category"]');

export const editStatusSelect = (page: Page) =>
  editDialog(page).locator('select[name="status"]');

export const saveButton = (page: Page) =>
  editDialog(page).getByRole("button", { name: "▸ Save" });

// ── Delete dialog locators ────────────────────────────────────────────────────

export const deleteDialog = (page: Page) => page.getByRole("alertdialog");

export const confirmDeleteButton = (page: Page) =>
  deleteDialog(page).getByRole("button", { name: "▸ DELETE" });

// ── Table row locators ────────────────────────────────────────────────────────

export const editButtonFor = (page: Page, description: string) =>
  page.getByRole("button", { name: `Edit ${description}` });

export const deleteButtonFor = (page: Page, description: string) =>
  page.getByRole("button", { name: `Delete ${description}` });

export const rowFor = (page: Page, description: string) =>
  page.getByRole("cell", { name: description, exact: true });

// ── Data factories ────────────────────────────────────────────────────────────

/** Returns a unique transaction payload for each call. */
export function uniqueTransaction() {
  const suffix =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  return {
    description: `Test Tx ${suffix}`,
    amount: "42",
  };
}

// ── Action helpers ────────────────────────────────────────────────────────────

/**
 * Creates a transaction through the home-page form.
 * Assumes the page is already on `/`.
 * Waits for the form to reset and the new row to appear in the table.
 */
export async function createTransaction(
  page: Page,
  data: { description: string; amount: string }
) {
  await descriptionInput(page).fill(data.description);
  await amountInput(page).fill(data.amount);
  await transmitButton(page).click();
  // Form resets on success — wait for description to clear
  await expect(descriptionInput(page)).toHaveValue("", { timeout: 10_000 });
  // Then wait for the new row to appear in the table
  await expect(rowFor(page, data.description)).toBeVisible({ timeout: 10_000 });
}
