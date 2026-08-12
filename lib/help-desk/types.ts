export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Waiting for User'
  | 'Resolved'
  | 'Closed';

export type TicketCategory =
  | 'Software'
  | 'Hardware'
  | 'Network'
  | 'Access'
  | 'Email'
  | 'Printer'
  | 'Security'
  | 'HR'
  | 'Payroll'
  | 'Other';

export interface TicketActivity {
  id: string;
  message: string;
  createdAt: string;
  userName: string;
}

export interface TicketComment {
  id: string;
  message: string;
  createdAt: string;
  userName: string;
  userId: string;
  internal?: boolean;
}

export interface TicketAttachment {
  id: string;
  name: string;
  size: number;
}

export interface HelpDeskTicket {
  id: string;
  ticketId: string;
  title: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  steps: string;
  status: TicketStatus;
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
  assignedTo: string | null;
  assignedToName: string | null;
  resolution: string;
  attachments: TicketAttachment[];
  activities: TicketActivity[];
  comments: TicketComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  title: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  steps?: string;
  attachments?: TicketAttachment[];
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
}
