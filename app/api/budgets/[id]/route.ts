import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function PATCH(request: NextRequest, { params }: { params: { id: string }}) {
  try {
    const { id } = params;
    const body = await request.json();
    const { amount } = body;

    if (amount == null) {
      return NextResponse.json({ error: "Missing amount" }, { status: 400 });
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: { amount: parseFloat(amount) },
      include: { category: true },
    });

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error("Error updating budget:", error);
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 });
  }
}