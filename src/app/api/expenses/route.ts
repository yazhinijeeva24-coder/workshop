import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const expenses = await db.expense.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json(
      { error: "Failed to load expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const category =
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : "Other";
    const note =
      typeof body.note === "string" ? body.note.trim().slice(0, 140) : "";
    const date = body.date ? new Date(body.date) : new Date();

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const expense = await db.expense.create({
      data: { amount: Math.round(amount * 100) / 100, category, note, date },
    });
    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json(
      { error: "Failed to save expense" },
      { status: 500 }
    );
  }
}
