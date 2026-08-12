import type { TicketCategory, TicketPriority, TicketStatus } from '@/lib/help-desk/types';

export const TICKET_CATEGORIES: TicketCategory[] = [
  'Software',
  'Hardware',
  'Network',
  'Access',
  'Email',
  'Printer',
  'Security',
  'HR',
  'Payroll',
  'Other',
];

export const TICKET_PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export const TICKET_STATUSES: TicketStatus[] = [
  'Open',
  'Assigned',
  'In Progress',
  'Waiting for User',
  'Resolved',
  'Closed',
];

export const PRIORITY_STYLES: Record<TicketPriority, string> = {
  Low: 'bg-[#EAF4FF] text-[#2563EB] border-[#D4E7FF]',
  Medium: 'bg-[#FFF4E5] text-[#F97316] border-[#FFE2B4]',
  High: 'bg-[#FFE8F0] text-[#DB2777] border-[#FFDAE5]',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const STATUS_STYLES: Record<TicketStatus, string> = {
  Open: 'bg-[#EAF4FF] text-[#2563EB] border-[#D4E7FF]',
  Assigned: 'bg-[#F4EBFF] text-[#7C3AED] border-[#E7DAFF]',
  'In Progress': 'bg-[#FFF4E5] text-[#F97316] border-[#FFE2B4]',
  'Waiting for User': 'bg-[#E8F6FF] text-[#0284C7] border-[#CDE7FF]',
  Resolved: 'bg-[#E6FFFA] text-[#059669] border-[#C8F7EE]',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};
