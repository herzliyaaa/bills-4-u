/*
  Warnings:

  - The `assignee` column on the `Bill` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "assignee",
ADD COLUMN     "assignee" TEXT NOT NULL DEFAULT 'none';

-- DropEnum
DROP TYPE "BillAssignee";

-- CreateIndex
CREATE INDEX "Bill_category_assignee_idx" ON "Bill"("category", "assignee");
