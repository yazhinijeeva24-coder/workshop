import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || currentMonthKey();
    const budget = await db.budget.findUnique({ where: { month } });
    return NextResponse.json({ budget: budget ?? null });
  } catch (error) {
    console.error("GET /api/budget error:", error);
    return NextResponse.json(
      { error: "Failed to load budget" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const month =
      typeof body.month === "string" && /^\d{4}-\d{2}$/.test(body.month)
        ? body.month
        : currentMonthKey();
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json(
        { error: "Budget must be zero or a positive number" },
        { status: 400 }
      );
    }

    const budget = await db.budget.upsert({
      where: { month },
      update: { amount },
      create: { month, amount },
    });
    return NextResponse.json({ budget });
  } catch (error) {
    console.error("PUT /api/budget error:", error);
    return NextResponse.json(
      { error: "Failed to save budget" },
      { status: 500 }
    );
  }
}
