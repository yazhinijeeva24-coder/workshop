// ── PennyPilot Smart Input Engine ──────────────────────────────────────────
// Lets people type expenses the way they think: "lunch 250", "uber ride 90
// yesterday", "coffee $4.5". We detect the amount, the category (from 100+
// everyday keywords) and the day — so adding an expense takes 2 seconds.

export type CategoryId =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Entertainment"
  | "Health"
  | "Education"
  | "Other";

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
  examples: string;
  keywords: string[];
};

export const CATEGORIES: Category[] = [
  {
    id: "Food",
    label: "Food & Dining",
    emoji: "🍜",
    color: "#f97316",
    examples: "lunch, coffee, groceries",
    keywords: [
      "food", "lunch", "dinner", "breakfast", "meal", "coffee", "tea", "chai",
      "snack", "snacks", "restaurant", "cafe", "pizza", "burger", "sandwich",
      "groceries", "grocery", "zomato", "swiggy", "doordash", "ubereats",
      "bakery", "juice", "icecream", "dessert", "cake", "drink", "drinks",
      "water bottle", "canteen", "mess", "tiffin", "dine", "brunch",
    ],
  },
  {
    id: "Transport",
    label: "Transport",
    emoji: "🚗",
    color: "#0ea5a4",
    examples: "uber, fuel, metro",
    keywords: [
      "uber", "ola", "lyft", "cab", "taxi", "auto", "rikshaw", "rickshaw",
      "bus", "train", "metro", "subway", "tram", "flight", "fuel", "petrol",
      "diesel", "gas", "gasoline", "parking", "toll", "ride", "bike",
      "scooter", "transport", "commute", "travel", "trip fare", "charge",
    ],
  },
  {
    id: "Shopping",
    label: "Shopping",
    emoji: "🛍️",
    color: "#ec4899",
    examples: "amazon, clothes, shoes",
    keywords: [
      "amazon", "flipkart", "ebay", "myntra", "ajio", "shein", "temu",
      "clothes", "cloth", "clothing", "shirt", "tshirt", "jeans", "dress",
      "shoes", "sneakers", "sandals", "watch", "bag", "backpack", "shopping",
      "mall", "gift", "makeup", "cosmetics", "perfume", "furniture", "decor",
      "gadget", "headphones", "phone", "laptop", "charger", "case",
    ],
  },
  {
    id: "Bills",
    label: "Bills & Rent",
    emoji: "💡",
    color: "#eab308",
    examples: "rent, electricity, wifi",
    keywords: [
      "rent", "electricity", "power bill", "water bill", "water", "internet",
      "broadband", "wifi", "bill", "bills", "recharge", "mobile", "phone bill",
      "postpaid", "prepaid", "insurance", "emi", "loan", "maintenance",
      "society", "hostel fee", "cable", "deduction", "tax", "subscription bill",
    ],
  },
  {
    id: "Entertainment",
    label: "Entertainment",
    emoji: "🎬",
    color: "#8b5cf6",
    examples: "movie, netflix, games",
    keywords: [
      "movie", "cinema", "film", "netflix", "prime", "hotstar", "spotify",
      "youtube", "disney", "subscription", "game", "games", "gaming", "steam",
      "playstation", "xbox", "concert", "event", "party", "club", "tour",
      "amusement", "bowling", "theme park", "book my show", "bookmyshow",
    ],
  },
  {
    id: "Health",
    label: "Health",
    emoji: "🏥",
    color: "#22c55e",
    examples: "medicine, gym, doctor",
    keywords: [
      "doctor", "medicine", "medicines", "pharmacy", "medical", "hospital",
      "clinic", "checkup", "check up", "consultation", "dentist", "gym",
      "fitness", "yoga", "protein", "supplements", "vitamins", "health",
      "therapy", "counseling", "lab test", "blood test", "xray", "scan",
    ],
  },
  {
    id: "Education",
    label: "Education",
    emoji: "📚",
    color: "#3b82f6",
    examples: "books, course, tuition",
    keywords: [
      "book", "books", "notebook", "stationery", "pen", "course", "courses",
      "udemy", "coursera", "tuition", "tution", "coaching", "school",
      "college", "exam", "exam fee", "class", "workshop", "certification",
      "study", "education", "kindle", "ebook", "training",
    ],
  },
  {
    id: "Other",
    label: "Other",
    emoji: "📦",
    color: "#94a3b8",
    examples: "anything else",
    keywords: [],
  },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, Category>
);

export function getCategory(id: string): Category {
  return CATEGORY_MAP[id as CategoryId] ?? CATEGORY_MAP.Other;
}

// ── Date parsing ───────────────────────────────────────────────────────────

export type DateHint = "today" | "yesterday";

function detectDateHint(text: string): { hint: DateHint; matched: string | null } {
  const t = ` ${text.toLowerCase()} `;
  if (t.includes(" day before yesterday ")) {
    return { hint: "yesterday", matched: "day before yesterday" };
  }
  if (t.includes("yesterday")) return { hint: "yesterday", matched: "yesterday" };
  if (t.includes("today")) return { hint: "today", matched: "today" };
  return { hint: "today", matched: null };
}

// ── Amount parsing ─────────────────────────────────────────────────────────
// Matches: "$4.5", "₹250", "rs.250", "rs 250", "250rs", "250.50", "1,250"

const AMOUNT_PATTERNS: RegExp[] = [
  /(?:rs\.?|inr|₹|\$|usd|€|£)\s?(\d{1,7}(?:,\d{3})*(?:\.\d{1,2})?)/i,
  /(\d{1,7}(?:,\d{3})*(?:\.\d{1,2})?)\s?(?:rs\.?|inr|₹|\$|usd|€|£)/i,
  /\b(\d{1,7}(?:,\d{3})*(?:\.\d{1,2})?)\b/,
];

function parseAmount(text: string): { amount: number | null; matched: string | null } {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = Number(match[1].replace(/,/g, ""));
      if (Number.isFinite(amount) && amount > 0) {
        return { amount, matched: match[0] };
      }
    }
  }
  return { amount: null, matched: null };
}

// ── Category detection ─────────────────────────────────────────────────────

function detectCategory(text: string): CategoryId | null {
  const t = ` ${text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ")} `;
  let best: { id: CategoryId; score: number } | null = null;

  for (const category of CATEGORIES) {
    for (const keyword of category.keywords) {
      if (t.includes(` ${keyword} `) || t.includes(` ${keyword}s `)) {
        // Longer keyword = more specific = wins (e.g. "exam fee" over "fee")
        const score = keyword.length;
        if (!best || score > best.score) {
          best = { id: category.id, score };
        }
      }
    }
  }
  return best?.id ?? null;
}

// ── Public API ─────────────────────────────────────────────────────────────

export type ParsedQuickInput = {
  amount: number | null;
  category: CategoryId;
  note: string;
  dateHint: DateHint;
  /** true when at least an amount was understood */
  valid: boolean;
};

export function parseQuickInput(raw: string): ParsedQuickInput {
  let text = raw.trim();
  const { hint, matched: dateMatch } = detectDateHint(text);
  if (dateMatch) {
    text = text.replace(new RegExp(dateMatch, "ig"), " ");
  }

  const { amount, matched: amountMatch } = parseAmount(text);
  let note = text;
  if (amountMatch) {
    note = note.replace(amountMatch, " ");
  }

  note = note
    .replace(/\b(for|of|on|at|to|the|a|an|spent|paid|bought|cost|rs|inr|usd)\b/gi, " ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const category = detectCategory(note) ?? detectCategory(raw) ?? "Other";

  return {
    amount,
    category,
    note: note.slice(0, 140),
    dateHint: hint,
    valid: amount !== null,
  };
}

// ── Formatting helpers ─────────────────────────────────────────────────────

export const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "₹ Indian Rupee" },
  { code: "USD", symbol: "$", label: "$ US Dollar" },
  { code: "EUR", symbol: "€", label: "€ Euro" },
  { code: "GBP", symbol: "£", label: "£ British Pound" },
] as const;

export function formatMoney(amount: number, symbol: string): string {
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? "-" : ""}${symbol}${formatted}`;
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
