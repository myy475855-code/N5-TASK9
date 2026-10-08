import { useState } from "react";
import LoginForm from "./components/LoginForm";
import InternshipSearch from "./components/InternshipSearch";

const internships = [
  { id: 1, title: "Frontend Developer", description: "React and JavaScript", status: "OPEN" },
  { id: 2, title: "Backend Developer", description: "Node.js and PostgreSQL", status: "OPEN" },
  { id: 3, title: "Security Intern", description: "OWASP and application security", status: "CLOSED" }
];

export default function App() {
  const [user, setUser] = useState(null);
  return <main>
    <header><h1>TalentBridge</h1><p>Secure internship management platform</p></header>
    {!user ? <LoginForm onSuccess={data => setUser(data.user)} /> : <p role="status">Welcome, {user.name}.</p>}
    <InternshipSearch internships={internships} />
  </main>;
}
