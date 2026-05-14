import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import type { User } from "@/api/users";
import UsersPage from "../UsersPage";
import { renderWithQuery } from "@/test/utils";

vi.mock("@/hooks/useUsers");
vi.mock("@/hooks/useCreateUser", () => ({
  useCreateUser: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock("@/lib/auth-client", () => ({
  useSession: () => ({ data: { user: { name: "Admin" } }, isPending: false }),
  signOut: vi.fn(),
}));

const { useUsers } = await import("@/hooks/useUsers");
const mockUseUsers = vi.mocked(useUsers);

function renderPage() {
  return render(
    <MemoryRouter>
      <UsersPage />
    </MemoryRouter>,
    { wrapper: renderWithQuery }
  );
}

const MOCK_USERS: User[] = [
  {
    id: "aaa-bbb-ccc-111111",
    name: "Alice Admin",
    email: "alice@example.com",
    role: "admin",
    emailVerified: true,
    createdAt: "2025-01-15T10:00:00.000Z",
  },
  {
    id: "ddd-eee-fff-222222",
    name: "Bob User",
    email: "bob@example.com",
    role: "user",
    emailVerified: false,
    createdAt: "2025-03-20T08:30:00.000Z",
  },
];

function mockedUsers(
  data: User[] | undefined,
  overrides: Record<string, unknown> = {}
) {
  return {
    data,
    isPending: false,
    isError: false,
    error: null,
    ...overrides,
  } as unknown as ReturnType<typeof useUsers>;
}

describe("UsersPage", () => {
  it("renders skeleton while data is loading", () => {
    mockUseUsers.mockReturnValue(mockedUsers(undefined, { isPending: true }));

    renderPage();

    expect(screen.getByText("LOADING...")).toBeInTheDocument();
    expect(
      document.querySelector("[data-slot='skeleton']")
    ).toBeInTheDocument();
  });

  it("renders an error message when the request fails", () => {
    mockUseUsers.mockReturnValue(
      mockedUsers(undefined, {
        isError: true,
        error: new Error("Failed to fetch users (403)"),
      })
    );

    renderPage();

    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(
      screen.getByText(/failed to fetch users \(403\)/i)
    ).toBeInTheDocument();
  });

  it("renders the user list when data is loaded", () => {
    mockUseUsers.mockReturnValue(mockedUsers(MOCK_USERS));

    renderPage();

    expect(screen.getByText("2 REC")).toBeInTheDocument();
    expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    expect(screen.getByText("Bob User")).toBeInTheDocument();
  });

  it("renders empty state when there are no users", () => {
    mockUseUsers.mockReturnValue(mockedUsers([]));

    renderPage();

    expect(screen.getByText("0 REC")).toBeInTheDocument();
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it("renders the masthead with ADMIN accent", () => {
    mockUseUsers.mockReturnValue(mockedUsers([]));

    renderPage();

    expect(screen.getByRole("banner")).toHaveTextContent("ADMIN");
  });

  describe("Create user modal", () => {
    beforeEach(() => {
      mockUseUsers.mockReturnValue(mockedUsers([]));
    });

    it("shows the modal when the New User button is clicked", async () => {
      renderPage();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: /new user/i }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("hides the modal when clicking the backdrop", async () => {
      renderPage();

      await userEvent.click(screen.getByRole("button", { name: /new user/i }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("presentation"));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("hides the modal when pressing the Escape key", async () => {
      renderPage();

      await userEvent.click(screen.getByRole("button", { name: /new user/i }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      fireEvent.keyDown(window, { key: "Escape" });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
