# PennyPilot

**Two-second expense tracking for everyone.**

PennyPilot is a friendly expense tracker built around one idea: logging money should take less effort than spending it. No signup, no forms, no dropdowns — just type what you spent in one line and PennyPilot figures out the amount, category and date automatically.

## Features

- **Smart Add** — type naturally: `lunch 250`, `uber ride 90 yesterday`, `coffee $4.5`. The parser detects the amount, category, currency and date in real time and shows a live preview before you press Enter. Press `/` anywhere to jump to the box.
- **How-to-Use guide** — a 5-step illustrated onboarding tour opens automatically on first visit (and can be reopened anytime from the header), so the app explains itself.
- **Budget Guard** — set a monthly budget and get a colour-coded guard rail: green while safe, amber past 80%, red when over — plus a "safe to spend per day" number.
- **Live insights** — month-end projection, this-week-vs-last comparison, biggest expense and a smart tip when one category dominates, all highlighted in colour.
- **Dashboard** — month navigator, KPI cards, category donut chart and a 14-day spending rhythm chart.
- **Full transaction management** — search, edit, delete with undo, CSV export, and past-month browsing.
- **4 currencies** (INR / USD / EUR / GBP), dark mode, and a fully responsive mobile layout.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Prisma](https://prisma.io) ORM with SQLite
- [Tailwind CSS 4](https://tailwindcss.com) + shadcn/ui components
- [Recharts](https://recharts.org) for charts, [Framer Motion](https://motion.dev) for animation
- [sonner](https://sonner.emilkowal.ski) for toasts

## Getting Started

```bash
# 1. install dependencies
bun install   # or: npm install

# 2. set up the database
bun run db:push

# 3. start the dev server
bun run dev   # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the how-to guide will walk you through the rest.

## Usage

Type an expense in the Smart Add box and press Enter:

| You type | PennyPilot logs |
| --- | --- |
| `lunch 250` | ₹250 · Food & Dining · today |
| `uber ride 90 yesterday` | ₹90 · Transport · yesterday |
| `coffee $4.5` | $4.50 · Food & Dining · today |

## Project Structure

```
src/
  app/            # App Router pages, API routes, manifest
  components/     # Smart Add, guide, budget guard, charts, transactions
  lib/            # Expense parser, categories, helpers
prisma/           # Schema (Expense, Budget)
public/pics/      # Illustrations used across the app
```

## License

MIT — free to use, modify and share.
