// Seed test data for browser verification
const BASE = "http://localhost:3000";

const seeds = [
  { amount: 40, category: "Food", note: "coffee", date: "2026-10-29T10:00:00" },
  { amount: 250, category: "Food", note: "lunch thali", date: "2026-10-29T13:30:00" },
  { amount: 2499, category: "Shopping", note: "amazon headphones", date: "2026-10-27T18:00:00" },
  { amount: 90, category: "Transport", note: "uber ride", date: "2026-10-25T09:00:00" },
  { amount: 199, category: "Entertainment", note: "netflix", date: "2026-10-20T20:00:00" },
  { amount: 350, category: "Education", note: "books", date: "2026-09-15T12:00:00" },
];

async function main() {
  for (const s of seeds) {
    const res = await fetch(`${BASE}/api/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    console.log(res.ok ? "seeded" : "FAILED", s.note, s.date.slice(0, 10));
  }
  const b = await fetch(`${BASE}/api/budget`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ month: "2026-10", amount: 20000 }),
  });
  console.log("budget 20000 →", b.ok ? "ok" : "fail");
}
main();
