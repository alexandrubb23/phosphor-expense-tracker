import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import type { User } from "@/api/users";
import { useUsers } from "@/hooks/useUsers";
import { renderWithQuery } from "@/test/utils";

vi.mock("@/api/users", () => ({
  usersApi: { fetchUsers: vi.fn() },
}));

const { usersApi } = await import("@/api/users");
const mockFetchUsers = vi.mocked(usersApi.fetchUsers);

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

const renderUseUsers = () =>
  renderHook(() => useUsers(), { wrapper: renderWithQuery });

describe("useUsers", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("is pending before the request resolves", () => {
    mockFetchUsers.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderUseUsers();

    expect(result.current.isPending).toBe(true);
  });

  it.each([
    { label: "full list", mockData: MOCK_USERS },
    { label: "empty list", mockData: [] },
  ])(
    "returns $label and delegates to usersApi on success",
    async ({ mockData }) => {
      mockFetchUsers.mockResolvedValue(mockData);

      const { result } = renderUseUsers();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(mockFetchUsers).toHaveBeenCalledTimes(1);
    }
  );

  it.each([
    { message: "Network Error" },
    { message: "Failed to fetch users (403)" },
    { message: "Unauthorized" },
  ])("surfaces error when the request fails: $message", async ({ message }) => {
    const error = new Error(message);
    mockFetchUsers.mockRejectedValue(error);

    const { result } = renderUseUsers();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});
