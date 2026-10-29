import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.expense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const data: {
      amount?: number;
      category?: string;
      note?: string;
      date?: Date;
    } = {};

    if (body.amount !== undefined) {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json(
          { error: "Amount must be a positive number" },
          { status: 400 }
        );
      }
      data.amount = Math.round(amount * 100) / 100;
    }
    if (body.category !== undefined) {
      data.category = String(body.category).trim() || "Other";
    }
    if (body.note !== undefined) {
      data.note = String(body.note).trim().slice(0, 140);
    }
    if (body.date !== undefined) {
      const date = new Date(body.date);
      if (Number.isNaN(date.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }
      data.date = date;
    }

    const expense = await db.expense.update({ where: { id }, data });
    return NextResponse.json({ expense });
  } catch (error) {
    console.error("PATCH /api/expenses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.expense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    await db.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/expenses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
