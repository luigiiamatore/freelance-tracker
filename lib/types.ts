export type IncomeStatus = "pending" | "paid" | "overdue";

export type ExpenseCategory = "Software" | "Travel" | "Office" | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Software",
  "Travel",
  "Office",
  "Other",
];

export type Income = {
  id: string;
  user_id: string;
  invoice_id: string | null;
  client: string;
  amount: number;
  date: string;
  status: IncomeStatus;
  notes: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  created_at: string;
};

export type Attachment = {
  id: string;
  user_id: string;
  income_id: string | null;
  expense_id: string | null;
  file_path: string;
  file_name: string;
  file_size: number;
  content_type: string | null;
  created_at: string;
};

export type AttachmentWithUrl = Attachment & { url: string | null };
