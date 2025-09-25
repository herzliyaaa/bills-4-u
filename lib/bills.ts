export type BillCategory =
  | 'spaylater'
  | 'electricity'
  | 'water'
  | 'internet'
  | 'grocery'
  | 'other';

export type BillAssignee =
  | 'lia'
  | 'mary'
  | 'none';
export type BillStatus = 'unpaid' | 'paid';
// Option lists for selects
export const CATEGORIES = [
  { value: 'spaylater',  label: 'SPayLater' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'water',       label: 'Water' },
  { value: 'internet',    label: 'Internet' },
  { value: 'grocery',     label: 'Grocery' },
  { value: 'other',       label: 'Other' },
] as const satisfies readonly { value: BillCategory; label: string }[];

export const ASSIGNEES = [
  { value: 'lia',  label: 'Lia' },
  { value: 'mary', label: 'Mary' },
  { value: 'none', label: 'Unassigned' },
] as const satisfies readonly { value: BillAssignee; label: string }[];

// What your API returns to the browser (JSON-friendly)
// Dates as ISO strings, Decimal as number
export interface BillDTO {
  id: string;
  name: string;
  provider?: string | null;
  source?: string | null;
  amount: number;           // API should serialize Decimal -> number
  currency: string;
  dueDate: string;          // ISO date string
  status: BillStatus;
  paidAt?: string | null;   // ISO datetime or null
  notes?: string | null;
  category: BillCategory;
  assignee: BillAssignee;
  createdAt: string;        // ISO datetime
  updatedAt: string;        // ISO datetime
}

// Inputs for API calls from the client
export type NewBillInput = {
  name: string;
  amount: number;
  dueDate: string;          // "yyyy-mm-dd"
  category: BillCategory;
  assignee: BillAssignee;
  provider?: string;
  notes?: string;
};

export type UpdateBillInput = Partial<{
  name: string;
  amount: number;
  dueDate: string;
  category: BillCategory;
  assignee: BillAssignee;
  provider: string | null;  // allow null to clear
  notes: string | null;     // allow null to clear
  status: BillStatus;
  paidAt: string | null;    // ISO or null
}>;