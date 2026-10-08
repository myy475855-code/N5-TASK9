import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../components/LoginForm";
import * as api from "../api";

beforeEach(() => vi.restoreAllMocks());

describe("LoginForm", () => {
  it("shows required validation for empty fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
  });

  it("rejects invalid email format", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText("Email"), "wrong-email");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("valid email");
  });

  it("rejects a short password", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("at least 8 characters");
  });

  it("renders an API failure message", async () => {
    vi.spyOn(api, "loginUser").mockRejectedValue(new Error("Invalid email or password."));
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password"));
  });
});
