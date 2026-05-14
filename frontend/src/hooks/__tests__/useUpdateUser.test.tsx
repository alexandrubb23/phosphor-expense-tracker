import { renderHook, waitFor, act } from "@testing-library/react";
import { vi } from "vitest";
import type { User } from "@/api/users";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { renderWithQuery } from "@/test/utils";

vi.mock("@/api/users", () => ({
  usersApi: { updateUser: vi.fn() },
}));

const { usersApi } = await import("@/api/users");
const mockUpdateUser = vi.mocked(usersApi.updateUser);

const USER_ID = "aaa-bbb-ccc-111111";

const EDIT_PAYLOAD = {
  name: "Alice Updated",
  email: "alice.updated@example.com",
};

const UPDATED_USER: User = {
  id: USER_ID,
  name: "Alice Updated",
  email: "alice.updated@example.com",
  role: "admin",
  emailVerified: true,
  createdAt: "2025-01-15T10:00:00.000Z",
};

const renderUseUpdateUser = () =>
  renderHook(() => useUpdateUser(USER_ID), { wrapper: renderWithQuery });

describe("useUpdateUser", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("is idle before being called", () => {
    const { result } = renderUseUpdateUser();

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("returns the updated user on success and delegates to usersApi", async () => {
    mockUpdateUser.mockResolvedValue(UPDATED_USER);

    const { result } = renderUseUpdateUser();

    await act(() => result.current.mutateAsync(EDIT_PAYLOAD));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(UPDATED_USER);
    expect(mockUpdateUser).toHaveBeenCalledWith(USER_ID, EDIT_PAYLOAD);
    expect(mockUpdateUser).toHaveBeenCalledTimes(1);
  });

  it("surfaces error when the request fails", async () => {
    const error = new Error("A user with this email already exists");
    mockUpdateUser.mockRejectedValue(error);

    const { result } = renderUseUpdateUser();

    await act(() => result.current.mutateAsync(EDIT_PAYLOAD).catch(() => {}));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});
