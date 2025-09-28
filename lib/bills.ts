export type BillCategory =
  | "spaylater"
  | "electricity"
  | "water"
  | "internet"
  | "grocery"
  | "other";

export type BillAssignee = "lia" | "mary" | "none";
export type BillStatus = "unpaid" | "paid";
export type Installment =
  | "bnpl"
  | "three_months"
  | "six_months"
  | "twelve_months";

// Option lists for selects
export const CATEGORIES = [
  { value: "spaylater", label: "SPayLater" },
  { value: "electricity", label: "Electricity" },
  { value: "water", label: "Water" },
  { value: "internet", label: "Internet" },
  { value: "grocery", label: "Grocery" },
  { value: "other", label: "Other" },
] as const satisfies readonly { value: BillCategory; label: string }[];

export const ASSIGNEES = [
  { value: "lia", label: "Lia" },
  { value: "mary", label: "Mary" },
  { value: "none", label: "Unassigned" },
] as const satisfies readonly { value: BillAssignee; label: string }[];

export const INSTALLMENTS = [
  { value: "bnpl", label: "BNPL" },
  { value: "three_months", label: "3 Months" },
  { value: "six_months", label: "6 Months" },
  { value: "twelve_months", label: "12 Months" },
] as const satisfies readonly { value: Installment; label: string }[];

// Dates as ISO strings, Decimal as number
export interface BillDTO {
  id: string;
  name: string;
  provider?: string | null;
  source?: string | null;
  amount: number; // API should serialize Decimal -> number
  currency: string;
  dueDate: string; // ISO date string
  status: BillStatus;
  paidAt?: string | null; // ISO datetime or null
  notes?: string | null;
  category: BillCategory;
  assignee: BillAssignee;
  installment?: Installment | null;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

// Inputs for API calls from the client
export type NewBillInput = {
  name: string;
  amount: number;
  dueDate: string; // "yyyy-mm-dd"
  category: BillCategory;
  assignee: BillAssignee;
  provider?: string;
  installment?: Installment;
  notes?: string;
};

export type UpdateBillInput = Partial<{
  name: string;
  amount: number;
  dueDate: string;
  category: BillCategory;
  assignee: BillAssignee;
  provider: string | null; // allow null to clear
  notes: string | null; // allow null to clear
  status: BillStatus;
  installment: Installment | null;
  paidAt: string | null; // ISO or null
}>;
