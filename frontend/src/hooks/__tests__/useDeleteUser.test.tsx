import { renderHook, waitFor, act } from "@testing-library/react";
import { vi } from "vitest";
import { useDeleteUser } from "@/hooks/useDeleteUser";
import { renderWithQuery } from "@/test/utils";

vi.mock("@/api/users", () => ({
  usersApi: { deleteUser: vi.fn() },
}));

const { usersApi } = await import("@/api/users");
const mockDeleteUser = vi.mocked(usersApi.deleteUser);

const USER_ID = "aaa-bbb-ccc-111111";

const renderUseDeleteUser = () =>
  renderHook(() => useDeleteUser(), { wrapper: renderWithQuery });

describe("useDeleteUser", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("is idle before being called", () => {
    const { result } = renderUseDeleteUser();

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("calls usersApi.deleteUser and resolves on success", async () => {
    mockDeleteUser.mockResolvedValue(undefined);

    const { result } = renderUseDeleteUser();

    await act(() => result.current.mutateAsync(USER_ID));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDeleteUser).toHaveBeenCalledWith(USER_ID);
    expect(mockDeleteUser).toHaveBeenCalledTimes(1);
  });

  it("surfaces error when the request fails", async () => {
    const error = new Error("User not found");
    mockDeleteUser.mockRejectedValue(error);

    const { result } = renderUseDeleteUser();

    await act(() => result.current.mutateAsync(USER_ID).catch(() => {}));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});
