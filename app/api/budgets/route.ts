import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/budgets - Get all budgets with spending data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly";
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString(),
    );
    const month = parseInt(
      searchParams.get("month") || (new Date().getMonth() + 1).toString(),
    );

    // Calculate date range based on period
    let startDate: Date;
    let endDate: Date;

    if (period === "yearly") {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    } else {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 1);
    }

    const budgets = await prisma.budget.findMany({
      where: {
        period,
        startDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: { category: { name: "asc" } },
    });

    // Calculate actual spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const actualSpending = await prisma.transaction.aggregate({
          where: {
            categoryId: budget.categoryId,
            type: "outflow",
            date: {
              gte: startDate,
              lt: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        return {
          ...budget,
          actualSpending: actualSpending._sum.amount?.toNumber() || 0,
          remaining:
            budget.amount.toNumber() -
            (actualSpending._sum.amount?.toNumber() || 0),
          percentage:
            budget.amount.toNumber() > 0
              ? ((actualSpending._sum.amount?.toNumber() || 0) /
                  budget.amount.toNumber()) *
                100
              : 0,
        };
      }),
    );

    return NextResponse.json(budgetsWithSpending);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 },
    );
  }
}

// POST /api/budgets - Create a new budget
export async function POST(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { categoryId, amount, currency, period, startDate } = body;

    if (!categoryId || !amount || !period) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }

    const budget = await prisma.budget.create({
      data: {
        categoryId,
        amount: parseFloat(amount),
        currency: currency || "PHP",
        period,
        startDate: startDate ? new Date(startDate) : new Date(),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 },
    );
  }
}
