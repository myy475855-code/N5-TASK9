export async function loginUser(credentials) {
  const response = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return data;
}
