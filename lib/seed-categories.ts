import { prisma } from "./prisma";

export async function seedCategories() {
  const categories = [
    // Income categories
    {
      name: "Salary",
      type: "income" as const,
      color: "#10B981",
      icon: "Briefcase",
    },
    {
      name: "Freelance",
      type: "income" as const,
      color: "#3B82F6",
      icon: "Laptop",
    },
    {
      name: "Investments",
      type: "income" as const,
      color: "#8B5CF6",
      icon: "TrendingUp",
    },
    {
      name: "Other Income",
      type: "income" as const,
      color: "#06B6D4",
      icon: "Plus",
    },

    // Expense categories (aligned with existing bill categories)
    {
      name: "SPayLater",
      type: "expense" as const,
      color: "#F59E0B",
      icon: "CreditCard",
    },
    {
      name: "Electricity",
      type: "expense" as const,
      color: "#6366F1",
      icon: "Zap",
    },
    {
      name: "Water",
      type: "expense" as const,
      color: "#F59E0B",
      icon: "Droplets",
    },
    {
      name: "Internet",
      type: "expense" as const,
      color: "#EF4444",
      icon: "Wifi",
    },
    {
      name: "Grocery",
      type: "expense" as const,
      color: "#10B981",
      icon: "ShoppingCart",
    },
    {
      name: "Transportation",
      type: "expense" as const,
      color: "#6B7280",
      icon: "Car",
    },
    {
      name: "Entertainment",
      type: "expense" as const,
      color: "#EC4899",
      icon: "Film",
    },
    {
      name: "Healthcare",
      type: "expense" as const,
      color: "#EF4444",
      icon: "Heart",
    },
    {
      name: "Education",
      type: "expense" as const,
      color: "#3B82F6",
      icon: "BookOpen",
    },
    {
      name: "Other Expenses",
      type: "expense" as const,
      color: "#6B7280",
      icon: "MoreHorizontal",
    },
    {
      name: "Savings",
      type: "expense" as const,
      color: "#059669",
      icon: "PiggyBank",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log("Categories seeded successfully");
}

async function main() {
  try {
    await seedCategories();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
