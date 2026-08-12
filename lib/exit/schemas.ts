import { z } from 'zod';
import { EXIT_INTERVIEW_REASONS, RESIGNATION_REASONS } from '@/lib/exit/types';

export const resignationSchema = z
  .object({
    resignationDate: z.string().min(1, 'Resignation date is required'),
    lastWorkingDay: z.string().min(1, 'Last working day is required'),
    noticePeriodDays: z.coerce.number().int().min(0, 'Notice period cannot be negative').max(180),
    reasonCategory: z.enum(RESIGNATION_REASONS, { required_error: 'Please select a reason' }),
    reasonDetails: z
      .string()
      .trim()
      .min(20, 'Please provide at least 20 characters of detail')
      .max(2000, 'Details must be under 2000 characters'),
    letterFileName: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const today = localIsoDate();
    const resign = values.resignationDate;
    const lwd = values.lastWorkingDay;

    if (resign) {
      if (!isIsoDate(resign)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid resignation date', path: ['resignationDate'] });
      } else if (resign < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Resignation date cannot be in the past',
          path: ['resignationDate'],
        });
      }
    }

    if (lwd) {
      if (!isIsoDate(lwd)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid last working day', path: ['lastWorkingDay'] });
      } else if (lwd < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Last working day cannot be in the past',
          path: ['lastWorkingDay'],
        });
      }
    }

    if (isIsoDate(resign) && isIsoDate(lwd) && lwd < resign) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Last working day cannot be before resignation date',
        path: ['lastWorkingDay'],
      });
    }
  });

function localIsoDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const parsed = new Date(y, m - 1, d);
  return parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d;
}

export const exitInterviewSchema = z.object({
  primaryReason: z.enum(EXIT_INTERVIEW_REASONS, { required_error: 'Please select a primary reason' }),
  experienceRating: z.coerce.number().min(1, 'Rating is required').max(5),
  managerRating: z.coerce.number().min(1, 'Rating is required').max(5),
  wouldRecommend: z.enum(['Yes', 'No', 'Maybe'], { required_error: 'Please select an option' }),
  likedMost: z.string().trim().min(10, 'Please share at least 10 characters').max(1000),
  improvements: z.string().trim().min(10, 'Please share at least 10 characters').max(1000),
  additionalComments: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const fullAndFinalSchema = z.object({
  assetsReturned: z.boolean(),
  accessRevoked: z.boolean(),
  leaveEncashment: z.coerce.number().min(0),
  gratuityAmount: z.coerce.number().min(0),
  otherDues: z.coerce.number().min(0),
  deductions: z.coerce.number().min(0),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  remarks: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const withdrawalSchema = z.object({
  reason: z.string().trim().min(10, 'Please explain your withdrawal request (min 10 characters)').max(1000),
});

export const approvalSchema = z.object({
  decision: z.enum(['Approved', 'Rejected']),
  comment: z.string().trim().max(1000).optional().or(z.literal('')),
});

export type ResignationFormValues = z.infer<typeof resignationSchema>;
export type ExitInterviewFormValues = z.infer<typeof exitInterviewSchema>;
export type FullAndFinalFormValues = z.infer<typeof fullAndFinalSchema>;
export type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;
