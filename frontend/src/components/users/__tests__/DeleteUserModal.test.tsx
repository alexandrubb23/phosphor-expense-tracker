import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AxiosError } from "axios";
import type { User } from "@/api/users";
import DeleteUserModal from "../DeleteUserModal";
import { renderWithQuery } from "@/test/utils";

vi.mock("@/hooks/useDeleteUser");

const { useDeleteUser } = await import("@/hooks/useDeleteUser");
const mockUseDeleteUser = vi.mocked(useDeleteUser);

const USER: User = {
  id: "aaa-bbb-ccc-111111",
  name: "Bob Regular",
  email: "bob@example.com",
  role: "user",
  emailVerified: true,
  createdAt: "2025-01-15T10:00:00.000Z",
};

function mockDeleteMutation(mutateAsync: ReturnType<typeof vi.fn>) {
  mockUseDeleteUser.mockReturnValue({
    mutateAsync,
  } as unknown as ReturnType<typeof useDeleteUser>);
}

function renderModal(user = USER, onClose = vi.fn()) {
  return render(<DeleteUserModal user={user} onClose={onClose} />, {
    wrapper: renderWithQuery,
  });
}

describe("DeleteUserModal", () => {
  beforeEach(() => {
    mockDeleteMutation(vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders user name and confirmation message", () => {
    renderModal();

    expect(screen.getByText("Delete User")).toBeInTheDocument();
    expect(screen.getByText(/Bob Regular/)).toBeInTheDocument();
    expect(
      screen.getByText(/This action cannot be undone/i)
    ).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    renderModal(USER, onClose);

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    renderModal(USER, onClose);

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls deleteUser with user id and closes on confirm", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    mockDeleteMutation(mutateAsync);
    renderModal(USER, onClose);

    await userEvent.click(screen.getByRole("button", { name: /delete$/i }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith(USER.id));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("shows server error message when deletion fails", async () => {
    const error = new AxiosError("Request failed");
    error.response = {
      data: { error: "Admin users cannot be deleted" },
    } as never;
    const mutateAsync = vi.fn().mockRejectedValue(error);
    mockDeleteMutation(mutateAsync);
    renderModal();

    await userEvent.click(screen.getByRole("button", { name: /delete$/i }));

    await waitFor(() =>
      expect(
        screen.getByText("⚠ Admin users cannot be deleted")
      ).toBeInTheDocument()
    );
  });
});
