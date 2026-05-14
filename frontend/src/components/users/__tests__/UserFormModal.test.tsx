import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AxiosError } from "axios";
import type { User } from "@/api/users";
import UserFormModal from "../UserFormModal";
import { renderWithQuery } from "@/test/utils";

vi.mock("@/hooks/useCreateUser");
vi.mock("@/hooks/useUpdateUser");

const { useCreateUser } = await import("@/hooks/useCreateUser");
const { useUpdateUser } = await import("@/hooks/useUpdateUser");
const mockUseCreateUser = vi.mocked(useCreateUser);
const mockUseUpdateUser = vi.mocked(useUpdateUser);

const EXISTING_USER: User = {
  id: "aaa-bbb-ccc-111111",
  name: "Alice Admin",
  email: "alice@example.com",
  role: "admin",
  emailVerified: true,
  createdAt: "2025-01-15T10:00:00.000Z",
};

function mockCreateMutation(mutateAsync: ReturnType<typeof vi.fn>) {
  mockUseCreateUser.mockReturnValue({
    mutateAsync,
  } as unknown as ReturnType<typeof useCreateUser>);
}

function mockUpdateMutation(mutateAsync: ReturnType<typeof vi.fn>) {
  mockUseUpdateUser.mockReturnValue({
    mutateAsync,
  } as unknown as ReturnType<typeof useUpdateUser>);
}

function renderCreateModal(onClose = vi.fn()) {
  return render(<UserFormModal onClose={onClose} />, {
    wrapper: renderWithQuery,
  });
}

function renderEditModal(user = EXISTING_USER, onClose = vi.fn()) {
  return render(<UserFormModal user={user} onClose={onClose} />, {
    wrapper: renderWithQuery,
  });
}

describe("UserFormModal", () => {
  beforeEach(() => {
    mockCreateMutation(vi.fn());
    mockUpdateMutation(vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("create mode", () => {
    it("renders the title, fields and CREATE USER button", () => {
      renderCreateModal();

      expect(screen.getByText("New User")).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create user/i })
      ).toBeInTheDocument();
    });

    describe("validation", () => {
      it.each([
        {
          label: "name is shorter than 3 characters",
          fields: {
            name: "Ab",
            email: "test@example.com",
            password: "password123",
          },
          error: /name must be at least 3 characters/i,
        },
        {
          label: "email is invalid",
          fields: {
            name: "Alice",
            email: "not-an-email",
            password: "password123",
          },
          error: /enter a valid email address/i,
        },
        {
          label: "password is shorter than 8 characters",
          fields: {
            name: "Alice",
            email: "alice@example.com",
            password: "short",
          },
          error: /password must be at least 8 characters/i,
        },
      ])("shows an error when $label", async ({ fields, error }) => {
        renderCreateModal();

        await userEvent.type(screen.getByLabelText(/name/i), fields.name);
        await userEvent.type(
          screen.getByLabelText(/email address/i),
          fields.email
        );
        await userEvent.type(
          screen.getByLabelText(/password/i),
          fields.password
        );
        await userEvent.click(
          screen.getByRole("button", { name: /create user/i })
        );

        expect(await screen.findByText(error)).toBeInTheDocument();
      });

      it("does not show errors before the form is submitted", async () => {
        renderCreateModal();

        await userEvent.type(screen.getByLabelText(/name/i), "Al");

        expect(
          screen.queryByText(/name must be at least 3 characters/i)
        ).not.toBeInTheDocument();
      });
    });

    describe("submission", () => {
      it("calls createUser mutateAsync with the entered values", async () => {
        const mutateAsync = vi.fn().mockResolvedValue({});
        mockCreateMutation(mutateAsync);
        renderCreateModal();

        await userEvent.type(screen.getByLabelText(/name/i), "Charlie New");
        await userEvent.type(
          screen.getByLabelText(/email address/i),
          "charlie@example.com"
        );
        await userEvent.type(screen.getByLabelText(/password/i), "secret123");
        await userEvent.click(
          screen.getByRole("button", { name: /create user/i })
        );

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce());
        expect(mutateAsync).toHaveBeenCalledWith({
          name: "Charlie New",
          email: "charlie@example.com",
          password: "secret123",
        });
      });

      it("calls onClose after a successful submission", async () => {
        const onClose = vi.fn();
        mockCreateMutation(vi.fn().mockResolvedValue({}));
        renderCreateModal(onClose);

        await userEvent.type(screen.getByLabelText(/name/i), "Charlie New");
        await userEvent.type(
          screen.getByLabelText(/email address/i),
          "charlie@example.com"
        );
        await userEvent.type(screen.getByLabelText(/password/i), "secret123");
        await userEvent.click(
          screen.getByRole("button", { name: /create user/i })
        );

        await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
      });

      it("shows a server error when the request fails", async () => {
        const axiosError = new AxiosError(
          "Request failed",
          "400",
          undefined,
          undefined,
          {
            data: { error: "A user with this email already exists" },
            status: 400,
          } as never
        );
        mockCreateMutation(vi.fn().mockRejectedValue(axiosError));
        renderCreateModal();

        await userEvent.type(screen.getByLabelText(/name/i), "Charlie New");
        await userEvent.type(
          screen.getByLabelText(/email address/i),
          "charlie@example.com"
        );
        await userEvent.type(screen.getByLabelText(/password/i), "secret123");
        await userEvent.click(
          screen.getByRole("button", { name: /create user/i })
        );

        expect(
          await screen.findByText(/a user with this email already exists/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("edit mode", () => {
    it("renders the title, pre-populated fields and SAVE CHANGES button", () => {
      renderEditModal();

      expect(screen.getByText("Edit User")).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toHaveValue(EXISTING_USER.name);
      expect(screen.getByLabelText(/email address/i)).toHaveValue(
        EXISTING_USER.email
      );
      expect(screen.getByLabelText(/password/i)).toHaveValue("");
      expect(
        screen.getByRole("button", { name: /save changes/i })
      ).toBeInTheDocument();
    });

    it("calls updateUser mutateAsync with the updated values", async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUpdateMutation(mutateAsync);
      renderEditModal();

      await userEvent.clear(screen.getByLabelText(/name/i));
      await userEvent.type(screen.getByLabelText(/name/i), "Alice Updated");
      await userEvent.click(
        screen.getByRole("button", { name: /save changes/i })
      );

      await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce());
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Alice Updated" })
      );
    });

    it("omits password from payload when left blank", async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUpdateMutation(mutateAsync);
      renderEditModal();

      await userEvent.click(
        screen.getByRole("button", { name: /save changes/i })
      );

      await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce());
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.not.objectContaining({ password: expect.anything() })
      );
    });

    it("includes password in payload when provided", async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUpdateMutation(mutateAsync);
      renderEditModal();

      await userEvent.type(
        screen.getByLabelText(/password/i),
        "newpassword123"
      );
      await userEvent.click(
        screen.getByRole("button", { name: /save changes/i })
      );

      await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce());
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ password: "newpassword123" })
      );
    });

    it("shows an error when provided password is shorter than 8 characters", async () => {
      renderEditModal();

      await userEvent.type(screen.getByLabelText(/password/i), "short");
      await userEvent.click(
        screen.getByRole("button", { name: /save changes/i })
      );

      expect(
        await screen.findByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });

    it("calls onClose after a successful save", async () => {
      const onClose = vi.fn();
      mockUpdateMutation(vi.fn().mockResolvedValue({}));
      renderEditModal(EXISTING_USER, onClose);

      await userEvent.click(
        screen.getByRole("button", { name: /save changes/i })
      );

      await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    });
  });
});
