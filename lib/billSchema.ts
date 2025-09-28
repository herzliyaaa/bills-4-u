import { z } from "zod";

/** Prisma enum  */
const CategoryEnum = z.enum([
  "spaylater",
  "electricity",
  "water",
  "internet",
  "grocery",
  "other",
]);
const AssigneeEnum = z.enum(["lia", "mary", "none"]);
const StatusEnum = z.enum(["unpaid", "paid"]);
const InstallmentEnum = z.enum([
  "bnpl",
  "three_months",
  "six_months",
  "twelve_months",
]);

/** Optional: UI <-> API mapping for the secondary dropdown */
export const uiPlanToInstallment = {
  BNPL: "bnpl",
  "6 months": "six_months",
  "12 months": "twelve_months",
  "3 months": "three_months",
} as const;

export const installmentToUiPlan: Record<
  z.infer<typeof InstallmentEnum>,
  string
> = {
  bnpl: "BNPL",
  three_months: "3 months",
  six_months: "6 months",
  twelve_months: "12 months",
};

/** Reusable date schema (yyyy-mm-dd) */
const YMD = /^\d{4}-\d{2}-\d{2}$/;
const ymdString = z.string().regex(YMD, "Use yyyy-mm-dd");

/**
 * CREATE: installment required iff category is spaylater; otherwise forbidden.
 * amount kept as number (you can convert to Decimal in service layer).
 */
export const billCreateSchema = z
  .object({
    name: z.string().min(1),
    amount: z.coerce.number().positive(),
    dueDate: ymdString,
    category: CategoryEnum,
    assignee: AssigneeEnum.optional(),
    provider: z.string().optional(),
    notes: z.string().optional(),
    installment: InstallmentEnum.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "spaylater" && !data.installment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installment"],
        message: 'installment is required when category is "spaylater".',
      });
    }
    if (data.category !== "spaylater" && data.installment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installment"],
        message: 'installment must be omitted unless category is "spaylater".',
      });
    }
  });

/**
 * UPDATE: partial fields, but we still enforce consistency on provided fields.
 * - If category is set to spaylater and installment is not provided, we require it here
 *   (note: if you want to allow "leave it as-is in DB", handle that at service layer).
 * - If installment is provided while category is provided and not spaylater -> error.
 */
export const billUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    amount: z.coerce.number().positive().optional(),
    dueDate: ymdString.optional(),
    category: CategoryEnum.optional(),
    assignee: AssigneeEnum.optional(),
    provider: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    status: StatusEnum.optional(),
    paidAt: ymdString.nullable().optional(),
    installment: InstallmentEnum.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "spaylater" && data.installment == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installment"],
        message: 'installment is required when category is "spaylater".',
      });
    }
    if (
      data.category &&
      data.category !== "spaylater" &&
      data.installment != null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installment"],
        message: 'installment must be omitted unless category is "spaylater".',
      });
    }
  });
