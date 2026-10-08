import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InternshipSearch from "../components/InternshipSearch";

const data = [
  { id: 1, title: "React Developer", description: "Frontend", status: "OPEN" },
  { id: 2, title: "Python Developer", description: "Backend", status: "OPEN" },
  { id: 3, title: "Security Analyst", description: "OWASP", status: "CLOSED" }
];

describe("InternshipSearch", () => {
  it("filters results by search text", async () => {
    const user = userEvent.setup();
    render(<InternshipSearch internships={data} />);
    await user.type(screen.getByLabelText("Search internships"), "python");
    expect(screen.getByText("Python Developer")).toBeInTheDocument();
    expect(screen.queryByText("React Developer")).not.toBeInTheDocument();
  });

  it("filters results by status", async () => {
    const user = userEvent.setup();
    render(<InternshipSearch internships={data} />);
    await user.selectOptions(screen.getByLabelText("Filter by status"), "CLOSED");
    expect(screen.getByText("Security Analyst")).toBeInTheDocument();
    expect(screen.queryByText("React Developer")).not.toBeInTheDocument();
  });

  it("shows an empty-state message when no internship matches", async () => {
    const user = userEvent.setup();
    render(<InternshipSearch internships={data} />);
    await user.type(screen.getByLabelText("Search internships"), "does-not-exist");
    expect(screen.getByRole("status")).toHaveTextContent("No internships found");
  });
});
