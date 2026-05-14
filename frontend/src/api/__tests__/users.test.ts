import { vi } from "vitest";
import axios from "axios";
import type { User, NewUser } from "@/api/users";

// Hoist the mock http methods so the vi.mock factory can reference them
const mockGet = vi.hoisted(() => vi.fn());
const mockPost = vi.hoisted(() => vi.fn());

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({ get: mockGet, post: mockPost })),
  },
}));

// Import after mocks are set up
const { usersApi } = await import("@/api/users");

// Capture axios.create call args at module load time (before any clearAllMocks)
const createCallArgs = vi.mocked(axios).create.mock.calls[0]?.[0];

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

const NEW_USER: NewUser = {
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

describe("UsersApi", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls GET /api/admin/users", async () => {
    mockGet.mockResolvedValue({ data: { users: MOCK_USERS } });

    await usersApi.fetchUsers();

    expect(mockGet).toHaveBeenCalledWith("/api/admin/users");
  });

  it("creates the axios instance with withCredentials: true", () => {
    expect(createCallArgs).toMatchObject({ withCredentials: true });
  });

  it("returns the users array extracted from the response", async () => {
    mockGet.mockResolvedValue({ data: { users: MOCK_USERS } });

    const result = await usersApi.fetchUsers();

    expect(result).toEqual(MOCK_USERS);
  });

  it("returns an empty array when the response contains no users", async () => {
    mockGet.mockResolvedValue({ data: { users: [] } });

    const result = await usersApi.fetchUsers();

    expect(result).toEqual([]);
  });

  it("propagates errors thrown by axios", async () => {
    const error = new Error("Network Error");
    mockGet.mockRejectedValue(error);

    await expect(usersApi.fetchUsers()).rejects.toThrow("Network Error");
  });

  describe("createUser", () => {
    const createUser = async () => {
      mockPost.mockResolvedValue({ data: { user: CREATED_USER } });

      await usersApi.createUser(NEW_USER);
    };
    it("calls POST /api/admin/users with the new user payload", async () => {
      await createUser();

      expect(mockPost).toHaveBeenCalledWith("/api/admin/users", NEW_USER);
    });

    it("returns the created user extracted from the response", async () => {
      await createUser();

      const result = await usersApi.createUser(NEW_USER);

      expect(result).toEqual(CREATED_USER);
    });

    it("propagates errors thrown by axios", async () => {
      const error = new Error("Conflict");
      mockPost.mockRejectedValue(error);

      await expect(usersApi.createUser(NEW_USER)).rejects.toThrow("Conflict");
    });
  });
});
