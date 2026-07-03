import { prisma } from "./lib/prisma";

async function verifyCategories() {
  try {
    const categories = await prisma.category.findMany({
      select: { name: true, type: true }
    });

    console.log(`Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.type})`);
    });
  } catch (error) {
    console.error('Error verifying categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCategories();