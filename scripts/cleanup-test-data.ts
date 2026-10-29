// Clean all test data: delete every expense and reset budgets
const BASE = "http://localhost:3000";

async function main() {
  const res = await fetch(`${BASE}/api/expenses`);
  const { expenses } = await res.json();
  for (const e of expenses) {
    const del = await fetch(`${BASE}/api/expenses/${e.id}`, { method: "DELETE" });
    console.log(`deleted ${e.id} (${e.note} ${e.amount}) → ${del.ok ? "ok" : "fail"}`);
  }
  // Reset budgets for any month rows back to 0 (= "not set" in the UI)
  const months = ["2026-10"];
  for (const month of months) {
    const r = await fetch(`${BASE}/api/budget`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, amount: 0 }),
    });
    console.log(`budget ${month} reset → ${r.ok ? "ok" : "fail"}`);
  }
  console.log("cleanup done");
}

main();
