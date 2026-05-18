import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { User } from "@/api/users";
import UserList from "../UserList";

const mockUsers: User[] = [
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

describe("UserList", () => {
  it("renders empty state when users array is empty", () => {
    render(<UserList users={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it("renders a row for each user", () => {
    render(<UserList users={mockUsers} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    expect(screen.getByText("Bob User")).toBeInTheDocument();
  });

  it("renders user emails", () => {
    render(<UserList users={mockUsers} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("renders short IDs derived from the full ID", () => {
    render(<UserList users={mockUsers} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("USR-111111")).toBeInTheDocument();
    expect(screen.getByText("USR-222222")).toBeInTheDocument();
  });

  it("shows admin role badge for admin users", () => {
    render(
      <UserList users={[mockUsers[0]]} onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    const badge = screen.getByText("admin");
    expect(badge).toBeInTheDocument();
    expect(badge.closest("span")).toHaveClass("text-purple");
  });

  it("shows user role badge for regular users", () => {
    render(
      <UserList users={[mockUsers[1]]} onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    const badge = screen.getByText("user");
    expect(badge).toBeInTheDocument();
    expect(badge.closest("span")).toHaveClass("text-muted");
  });

  it("shows YES for verified email", () => {
    render(
      <UserList users={[mockUsers[0]]} onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByText("YES")).toHaveClass("text-green");
  });

  it("shows NO for unverified email", () => {
    render(
      <UserList users={[mockUsers[1]]} onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByText("NO")).toHaveClass("text-red");
  });

  it("renders all table column headers", () => {
    render(<UserList users={mockUsers} onEdit={vi.fn()} onDelete={vi.fn()} />);
    for (const heading of [
      "ID",
      "NAME",
      "EMAIL",
      "ROLE",
      "VERIFIED",
      "JOINED",
    ]) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }
  });
});
