import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AxiosError } from "axios";
import CreateUserModal from "../CreateUserModal";
import { renderWithQuery } from "@/test/utils";

vi.mock("@/hooks/useCreateUser");

const { useCreateUser } = await import("@/hooks/useCreateUser");
const mockUseCreateUser = vi.mocked(useCreateUser);

function mockMutation(mutateAsync: ReturnType<typeof vi.fn>) {
  mockUseCreateUser.mockReturnValue({ mutateAsync } as unknown as ReturnType<
    typeof useCreateUser
  >);
}

function renderModal(onClose = vi.fn()) {
  return render(<CreateUserModal onClose={onClose} />, {
    wrapper: renderWithQuery,
  });
}

describe("CreateUserModal", () => {
  beforeEach(() => {
    mockMutation(vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the name, email and password fields with a submit button", () => {
    renderModal();

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
      renderModal();

      await userEvent.type(screen.getByLabelText(/name/i), fields.name);
      await userEvent.type(
        screen.getByLabelText(/email address/i),
        fields.email
      );
      await userEvent.type(screen.getByLabelText(/password/i), fields.password);
      await userEvent.click(
        screen.getByRole("button", { name: /create user/i })
      );

      expect(await screen.findByText(error)).toBeInTheDocument();
    });

    it("does not show errors before the form is submitted", async () => {
      renderModal();

      await userEvent.type(screen.getByLabelText(/name/i), "Al");

      expect(
        screen.queryByText(/name must be at least 3 characters/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("submission", () => {
    it("calls mutateAsync with the entered values on valid submit", async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockMutation(mutateAsync);
      renderModal();

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
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockMutation(mutateAsync);
      renderModal(onClose);

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
      const mutateAsync = vi.fn().mockRejectedValue(axiosError);
      mockMutation(mutateAsync);
      renderModal();

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
