import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/transactions - Get all transactions with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "inflow" | "outflow" | null;
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const assignee = searchParams.get("assignee");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (assignee) where.assignee = assignee;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.transaction.count({ where });

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, amount, currency, categoryId, date, description, assignee } =
      body;

    if (!type || !amount || !categoryId || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify category exists and matches transaction type
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }
    //TODO:  change the isSavings logic from using includes to category.isSavings === true (you’d add a boolean field in DB)
    const isSavings = category.name.toLowerCase().includes("savings");

    // Only enforce strict rules if NOT savings
    if (!isSavings) {
      if (category.type === "income" && type !== "inflow") {
        return NextResponse.json(
          { error: "Income categories can only be used for inflows" },
          { status: 400 },
        );
      }

      if (category.type === "expense" && type !== "outflow") {
        return NextResponse.json(
          { error: "Expense categories can only be used for outflows" },
          { status: 400 },
        );
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        currency: currency || "PHP",
        categoryId,
        date: new Date(date),
        description,
        assignee: assignee || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
