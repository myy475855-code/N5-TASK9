import { useState } from "react";
import { loginUser } from "../api";

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!email.trim()) return setError("Email is required.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      onSuccess?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={submit} aria-label="login form">
    <h2>Sign in</h2>
    <label>Email<input aria-label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label>Password<input aria-label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
    {error && <p role="alert">{error}</p>}
    <button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
  </form>;
}
