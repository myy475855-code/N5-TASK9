import { useMemo, useState } from "react";

export default function InternshipSearch({ internships = [] }) {
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("ALL");
  const results = useMemo(() => internships.filter(item => {
    const matchesTerm = `${item.title} ${item.description}`.toLowerCase().includes(term.toLowerCase());
    const matchesStatus = status === "ALL" || item.status === status;
    return matchesTerm && matchesStatus;
  }), [internships, term, status]);

  return <section aria-label="internship search">
    <label>Search internships<input aria-label="Search internships" value={term} onChange={e => setTerm(e.target.value)} /></label>
    <label>Status<select aria-label="Filter by status" value={status} onChange={e => setStatus(e.target.value)}><option value="ALL">All</option><option value="OPEN">Open</option><option value="CLOSED">Closed</option></select></label>
    <ul>{results.map(item => <li key={item.id}><strong>{item.title}</strong><span> — {item.status}</span></li>)}</ul>
    {!results.length && <p role="status">No internships found.</p>}
  </section>;
}
