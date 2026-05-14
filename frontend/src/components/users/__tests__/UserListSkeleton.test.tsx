import { render, screen } from "@testing-library/react";
import UserListSkeleton from "../UserListSkeleton";

describe("UserListSkeleton", () => {
  it("renders the default 5 skeleton rows", () => {
    render(<UserListSkeleton />);
    // Each row has 6 cells; 5 rows × 6 cells = 30 skeleton divs
    const skeletons = document.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons).toHaveLength(30);
  });

  it("renders a custom number of rows", () => {
    render(<UserListSkeleton rows={3} />);
    const skeletons = document.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons).toHaveLength(18); // 3 rows × 6 cells
  });

  it("renders all column headers", () => {
    render(<UserListSkeleton />);
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
