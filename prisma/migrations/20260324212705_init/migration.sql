-- CreateEnum
CREATE TYPE "public"."BillStatus" AS ENUM ('unpaid', 'paid');

-- CreateEnum
CREATE TYPE "public"."BillCategory" AS ENUM ('spaylater', 'electricity', 'water', 'internet', 'grocery', 'other');

-- CreateEnum
CREATE TYPE "public"."Installment" AS ENUM ('bnpl', 'three_months', 'six_months', 'twelve_months');

-- CreateEnum
CREATE TYPE "public"."BillAssignee" AS ENUM ('lia', 'mary', 'none');

-- CreateTable
CREATE TABLE "public"."Bill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "source" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."BillStatus" NOT NULL DEFAULT 'unpaid',
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "category" "public"."BillCategory" NOT NULL,
    "installment" "public"."Installment",
    "assignee" "public"."BillAssignee" NOT NULL DEFAULT 'none',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bill_dueDate_idx" ON "public"."Bill"("dueDate");

-- CreateIndex
CREATE INDEX "Bill_status_idx" ON "public"."Bill"("status");

-- CreateIndex
CREATE INDEX "Bill_category_assignee_idx" ON "public"."Bill"("category", "assignee");
