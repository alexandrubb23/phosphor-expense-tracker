import { renderHook, waitFor, act } from "@testing-library/react";
import { vi } from "vitest";
import type { User } from "@/api/users";
import { useCreateUser } from "@/hooks/useCreateUser";
import { renderWithQuery } from "@/test/utils";

vi.mock("@/api/users", () => ({
  usersApi: { createUser: vi.fn() },
}));

const { usersApi } = await import("@/api/users");
const mockCreateUser = vi.mocked(usersApi.createUser);

const NEW_USER = {
  name: "Charlie New",
  email: "charlie@example.com",
  password: "secret123",
};

const CREATED_USER: User = {
  id: "ggg-hhh-iii-333333",
  name: "Charlie New",
  email: "charlie@example.com",
  role: "user",
  emailVerified: false,
  createdAt: "2025-05-01T12:00:00.000Z",
};

const renderUseCreateUser = () =>
  renderHook(() => useCreateUser(), { wrapper: renderWithQuery });

describe("useCreateUser", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("is idle before being called", () => {
    const { result } = renderUseCreateUser();

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("returns the created user on success and delegates to usersApi", async () => {
    mockCreateUser.mockResolvedValue(CREATED_USER);

    const { result } = renderUseCreateUser();

    await act(() => result.current.mutateAsync(NEW_USER));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(CREATED_USER);
    expect(mockCreateUser).toHaveBeenCalledWith(NEW_USER);
    expect(mockCreateUser).toHaveBeenCalledTimes(1);
  });

  it("surfaces error when the request fails", async () => {
    const error = new Error("A user with this email already exists");
    mockCreateUser.mockRejectedValue(error);

    const { result } = renderUseCreateUser();

    await act(() => result.current.mutateAsync(NEW_USER).catch(() => {}));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});
