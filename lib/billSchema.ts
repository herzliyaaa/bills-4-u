import { z } from 'zod';

export const billCreateSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // yyyy-mm-dd
  category: z.enum(['spaylater','electricity','water','internet','grocery','other']),
  assignee: z.enum(['lia','mary','none']).optional(),
  provider: z.string().optional(),
  notes: z.string().optional(),
});

export const billUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.coerce.number().positive().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.enum(['spaylater','electricity','water','internet','grocery','other']).optional(),
  assignee: z.enum(['lia','mary','none']).optional(),
  provider: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['unpaid','paid']).optional(),
  paidAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
