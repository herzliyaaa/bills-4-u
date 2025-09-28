"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  ASSIGNEES,
  INSTALLMENTS,
  type BillDTO as Bill,
  type UpdateBillInput,
} from "@/lib/bills";
import { billUpdateSchema } from "@/lib/billSchema";
import { useBills } from "@/lib/useBills";

/** ---------- utils ---------- */
const toYMD = (isoOrYmd?: string | null) =>
  !isoOrYmd ? "" : isoOrYmd.includes("T") ? isoOrYmd.slice(0, 10) : isoOrYmd;

const isDifferent = (a: unknown, b: unknown) =>
  JSON.stringify(a) !== JSON.stringify(b);

/** Keep schema in sync with server. UI accepts "" then we convert to null on submit. */
const formSchema = billUpdateSchema.safeExtend({
  provider: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function BillEditModal({
  bill,
  open,
  onClose,
}: {
  bill: Bill;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { updateBill, removeBill } = useBills();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const form = useForm<FormValues, any>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: bill.name,
      amount: bill.amount,
      dueDate: toYMD(bill.dueDate),
      category: bill.category,
      assignee: bill.assignee,
      provider: bill.provider ?? "",
      notes: bill.notes ?? "",
      status: bill.status,
      paidAt: toYMD(bill.paidAt ?? undefined),
      installment: bill.installment ?? undefined,
    },
    mode: "onBlur",
  });

  const category = form.watch("category");
  const status = form.watch("status");

  React.useEffect(() => {
    if (category && category !== "spaylater") {
      form.setValue("installment", undefined, { shouldDirty: true });
    }
  }, [category, form]);

  React.useEffect(() => {
    if (status === "unpaid") {
      form.setValue("paidAt", undefined, { shouldDirty: true });
    }
  }, [status, form]);

  async function onSubmit(values: FormValues) {
    const patch: UpdateBillInput = {};
    const setIfChanged = <K extends keyof UpdateBillInput>(
      key: K,
      next: UpdateBillInput[K],
      current: unknown
    ) => {
      if (isDifferent(next, current)) (patch as any)[key] = next;
    };

    if (values.name !== undefined) setIfChanged("name", values.name, bill.name);
    if (values.amount !== undefined)
      setIfChanged("amount", Number(values.amount), bill.amount);
    if (values.dueDate !== undefined)
      setIfChanged("dueDate", values.dueDate, toYMD(bill.dueDate));
    if (values.category !== undefined)
      setIfChanged("category", values.category, bill.category);
    if (values.assignee !== undefined)
      setIfChanged("assignee", values.assignee, bill.assignee);

    // "" -> null clears
    if (values.provider !== undefined) {
      const next =
        values.provider.trim() === "" ? null : values.provider.trim();
      setIfChanged("provider", next, bill.provider ?? null);
    }
    if (values.notes !== undefined) {
      const next = values.notes.trim() === "" ? null : values.notes.trim();
      setIfChanged("notes", next, bill.notes ?? null);
    }

    // status / paidAt
    if (values.status !== undefined) {
      setIfChanged("status", values.status, bill.status);
      if (values.status === "paid" && !values.paidAt) {
        const ymd = new Date().toISOString().slice(0, 10);
        setIfChanged("paidAt", ymd, toYMD(bill.paidAt ?? undefined));
      }
    }
    if (values.paidAt !== undefined) {
      const next = values.status === "unpaid" ? null : values.paidAt ?? null;
      setIfChanged("paidAt", next, bill.paidAt ? toYMD(bill.paidAt) : null);
    }

    // installment rules
    if (values.category && values.category !== "spaylater") {
      if (bill.installment != null)
        setIfChanged("installment", null, bill.installment);
    } else if (values.installment !== undefined) {
      setIfChanged(
        "installment",
        values.installment ?? null,
        bill.installment ?? null
      );
    }

    try {
      await updateBill(bill.id, patch);
      onClose();
      router.refresh?.();
    } catch (e) {
      console.error(e);
      alert("Update failed. Please try again.");
    }
  }

  async function onDelete() {
    if (!confirm("Delete this bill? This cannot be undone.")) return;
    try {
      await removeBill(bill.id);
      onClose();
      router.refresh?.();
    } catch (e) {
      console.error(e);
      alert("Delete failed. Please try again.");
    }
  }

  const { errors, isSubmitting, isDirty } = form.formState;

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit bill"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg border bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Edit Bill</h2>
            <p className="text-xs text-gray-500">
              Update details or mark this bill as paid.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="cursor-pointer" onClick={onClose}>
              Close
            </Button>
            <Button variant="destructive" className="cursor-pointer" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                {...form.register("name")}
                placeholder="Meralco, Maynilad, etc."
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">
                  {String(errors.name.message)}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount (PHP)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-600">
                  {String(errors.amount.message)}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                {...form.register("dueDate")}
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-600">
                  {String(errors.dueDate.message)}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                {...form.register("category")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600">
                  {String(errors.category.message)}
                </p>
              )}
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assignee
              </label>
              <select
                className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                {...form.register("assignee")}
              >
                {ASSIGNEES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
              {errors.assignee && (
                <p className="mt-1 text-xs text-red-600">
                  {String(errors.assignee.message)}
                </p>
              )}
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Provider
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                {...form.register("provider")}
                placeholder="Optional"
              />
              {errors.provider && (
                <p className="mt-1 text-xs text-red-600">
                  {String(errors.provider.message)}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                {...form.register("notes")}
                placeholder="Optional"
              />
              {errors.notes && (
                <p className="mt-1 text-xs text-red-600">
                  {String(errors.notes.message)}
                </p>
              )}
            </div>

            {/* Installment (SPayLater only) */}
            {category === "spaylater" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Installment Plan
                </label>
                <select
                  className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                  {...form.register("installment")}
                >
                  <option value="" />
                  {INSTALLMENTS.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
                {errors.installment && (
                  <p className="mt-1 text-xs text-red-600">
                    {String(errors.installment.message)}
                  </p>
                )}
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                {...form.register("status")}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-xs text-red-600">
                  {String(errors.status.message)}
                </p>
              )}
            </div>

            {/* Paid At (only when Paid) */}
            {status === "paid" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Paid At
                </label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  {...form.register("paidAt")}
                />
                {errors.paidAt && (
                  <p className="mt-1 text-xs text-red-600">
                    {String(errors.paidAt.message)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 cursor-pointer hover:bg-indigo-500"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
