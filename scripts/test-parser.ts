// Quick sanity tests for the PennyPilot parser
import { parseQuickInput } from "../src/lib/categories";

const cases: [string, string, number, string][] = [
  ["lunch 250", "Food", 250, "lunch"],
  ["uber ride 90 yesterday", "Transport", 90, "uber ride"],
  ["coffee $4.5", "Food", 4.5, "coffee"],
  ["groceries 899", "Food", 899, "groceries"],
  ["movie 300 yesterday", "Entertainment", 300, "movie"],
  ["electricity bill 1200", "Bills", 1200, "electricity bill"],
  ["netflix subscription 199", "Entertainment", 199, "netflix subscription"],
  ["gym membership 1500", "Health", 1500, "gym membership"],
  ["bought books for 450", "Education", 450, "bought books"],
  ["amazon order 1299", "Shopping", 1299, "amazon order"],
  ["rs. 75 for chai", "Food", 75, "chai"],
  ["1,250 for shoes", "Shopping", 1250, "shoes"],
  ["mystery stuff 100", "Other", 100, "mystery stuff"],
];

let pass = 0;
for (const [input, wantCat, wantAmount, noteContains] of cases) {
  const r = parseQuickInput(input);
  const ok =
    r.category === wantCat &&
    r.amount === wantAmount &&
    r.valid &&
    r.note.toLowerCase().includes(noteContains.toLowerCase());
  console.log(
    `${ok ? "PASS" : "FAIL"}  "${input}" → amount=${r.amount} cat=${r.category} note="${r.note}" day=${r.dateHint}`
  );
  if (!ok) {
    console.log(`      expected cat=${wantCat} amount=${wantAmount} note~${noteContains}`);
  }
  if (ok) pass++;
}
console.log(`\n${pass}/${cases.length} passed`);
