import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Expense, Income } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: incomeData }, { data: expenseData }] = await Promise.all([
    supabase.from("income").select("*").order("date", { ascending: false }),
    supabase.from("expenses").select("*").order("date", { ascending: false }),
  ]);

  const income = (incomeData ?? []) as Income[];
  const expenses = (expenseData ?? []) as Expense[];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Freelance Tracker";
  workbook.created = new Date();

  const incomeSheet = workbook.addWorksheet("Income");
  incomeSheet.columns = [
    { header: "Client", key: "client", width: 28 },
    { header: "Invoice #", key: "invoice_id", width: 16 },
    { header: "Date", key: "date", width: 14 },
    { header: "Status", key: "status", width: 12 },
    { header: "Amount (€)", key: "amount", width: 14 },
    { header: "Notes", key: "notes", width: 32 },
  ];
  incomeSheet.getRow(1).font = { bold: true };
  for (const item of income) {
    incomeSheet.addRow({
      client: item.client,
      invoice_id: item.invoice_id ?? "",
      date: item.date,
      status: item.status,
      amount: item.amount,
      notes: item.notes ?? "",
    });
  }
  incomeSheet.getColumn("amount").numFmt = "€#,##0.00";

  const expensesSheet = workbook.addWorksheet("Expenses");
  expensesSheet.columns = [
    { header: "Description", key: "description", width: 32 },
    { header: "Category", key: "category", width: 16 },
    { header: "Date", key: "date", width: 14 },
    { header: "Amount (€)", key: "amount", width: 14 },
  ];
  expensesSheet.getRow(1).font = { bold: true };
  for (const item of expenses) {
    expensesSheet.addRow({
      description: item.description,
      category: item.category,
      date: item.date,
      amount: item.amount,
    });
  }
  expensesSheet.getColumn("amount").numFmt = "€#,##0.00";

  const buffer = await workbook.xlsx.writeBuffer();
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="freelance-tracker-${today}.xlsx"`,
    },
  });
}
