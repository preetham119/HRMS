import type {
  CreateTicketInput,
  HelpDeskTicket,
  TicketComment,
  TicketStatus,
} from '@/lib/help-desk/types';

const STORAGE_KEY = 'hrms-helpdesk-tickets';

function now() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function seedTickets(): HelpDeskTicket[] {
  const createdAt = now();
  return [
    {
      id: createId('tk'),
      ticketId: 'T-000001',
      title: 'Unable to access payroll portal',
      category: 'Payroll',
      priority: 'High',
      description: 'Getting an access denied error when opening the payroll page.',
      steps: '1. Open Payroll\n2. Click Salary Slips\n3. Error appears',
      status: 'Open',
      createdBy: 'usr-emp-001',
      createdByName: 'Rajesh Kumar',
      createdByEmail: 'employee@company.com',
      assignedTo: null,
      assignedToName: null,
      resolution: '',
      attachments: [],
      activities: [
        {
          id: createId('act'),
          message: 'Ticket created',
          createdAt,
          userName: 'Rajesh Kumar',
        },
      ],
      comments: [],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: createId('tk'),
      ticketId: 'T-000002',
      title: 'Update emergency contact details',
      category: 'HR',
      priority: 'Medium',
      description: 'Need HR to update my emergency contact in the employee profile.',
      steps: '',
      status: 'In Progress',
      createdBy: 'usr-emp-001',
      createdByName: 'Rajesh Kumar',
      createdByEmail: 'employee@company.com',
      assignedTo: 'usr-hr-001',
      assignedToName: 'HR Admin',
      resolution: '',
      attachments: [],
      activities: [
        {
          id: createId('act'),
          message: 'Ticket created',
          createdAt,
          userName: 'Rajesh Kumar',
        },
        {
          id: createId('act'),
          message: 'Assigned to HR Admin',
          createdAt,
          userName: 'HR Admin',
        },
      ],
      comments: [
        {
          id: createId('cmt'),
          message: 'We are verifying the request with your manager.',
          createdAt,
          userName: 'HR Admin',
          userId: 'usr-hr-001',
        },
      ],
      createdAt,
      updatedAt: createdAt,
    },
  ];
}

export function getTickets(): HelpDeskTicket[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedTickets();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as HelpDeskTicket[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTickets(tickets: HelpDeskTicket[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function nextTicketId(tickets: HelpDeskTicket[]) {
  const max = tickets.reduce((acc, ticket) => {
    const num = Number(ticket.ticketId.replace(/\D/g, ''));
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 0);
  return `T-${String(max + 1).padStart(6, '0')}`;
}

export function getTicketById(id: string) {
  return getTickets().find((ticket) => ticket.id === id || ticket.ticketId === id) ?? null;
}

export function getTicketsForUser(userId: string, canSeeAll: boolean) {
  const tickets = getTickets().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  if (canSeeAll) return tickets;
  return tickets.filter((ticket) => ticket.createdBy === userId);
}

export function createTicket(input: CreateTicketInput): HelpDeskTicket {
  const tickets = getTickets();
  const createdAt = now();
  const ticket: HelpDeskTicket = {
    id: createId('tk'),
    ticketId: nextTicketId(tickets),
    title: input.title.trim(),
    category: input.category,
    priority: input.priority,
    description: input.description.trim(),
    steps: input.steps?.trim() ?? '',
    status: 'Open',
    createdBy: input.createdBy,
    createdByName: input.createdByName,
    createdByEmail: input.createdByEmail,
    assignedTo: null,
    assignedToName: null,
    resolution: '',
    attachments: input.attachments ?? [],
    activities: [
      {
        id: createId('act'),
        message: 'Ticket created',
        createdAt,
        userName: input.createdByName,
      },
    ],
    comments: [],
    createdAt,
    updatedAt: createdAt,
  };

  saveTickets([ticket, ...tickets]);
  return ticket;
}

export function updateTicketStatus(
  id: string,
  status: TicketStatus,
  actorName: string,
  resolution = '',
) {
  const tickets = getTickets();
  const index = tickets.findIndex((ticket) => ticket.id === id);
  if (index < 0) return null;

  const updatedAt = now();
  const current = tickets[index];
  const next: HelpDeskTicket = {
    ...current,
    status,
    resolution: resolution || current.resolution,
    updatedAt,
    activities: [
      {
        id: createId('act'),
        message: `Status changed to ${status}`,
        createdAt: updatedAt,
        userName: actorName,
      },
      ...current.activities,
    ],
  };

  tickets[index] = next;
  saveTickets(tickets);
  return next;
}

export function assignTicket(
  id: string,
  assigneeId: string,
  assigneeName: string,
  actorName: string,
) {
  const tickets = getTickets();
  const index = tickets.findIndex((ticket) => ticket.id === id);
  if (index < 0) return null;

  const updatedAt = now();
  const current = tickets[index];
  const next: HelpDeskTicket = {
    ...current,
    assignedTo: assigneeId,
    assignedToName: assigneeName,
    status: current.status === 'Open' ? 'Assigned' : current.status,
    updatedAt,
    activities: [
      {
        id: createId('act'),
        message: `Assigned to ${assigneeName}`,
        createdAt: updatedAt,
        userName: actorName,
      },
      ...current.activities,
    ],
  };

  tickets[index] = next;
  saveTickets(tickets);
  return next;
}

export function addTicketComment(
  id: string,
  comment: Omit<TicketComment, 'id' | 'createdAt'>,
): HelpDeskTicket | null {
  const tickets = getTickets();
  const index = tickets.findIndex((ticket) => ticket.id === id);
  if (index < 0) return null;

  const updatedAt = now();
  const current = tickets[index];
  const nextComment: TicketComment = {
    ...comment,
    id: createId('cmt'),
    createdAt: updatedAt,
  };

  const next: HelpDeskTicket = {
    ...current,
    updatedAt,
    comments: [nextComment, ...current.comments],
    activities: [
      {
        id: createId('act'),
        message: 'Comment added',
        createdAt: updatedAt,
        userName: comment.userName,
      },
      ...current.activities,
    ],
  };

  tickets[index] = next;
  saveTickets(tickets);
  return next;
}

export function getTicketStats(tickets: HelpDeskTicket[]) {
  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress' || t.status === 'Assigned').length,
    resolved: tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
  };
}
