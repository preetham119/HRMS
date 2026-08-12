import TicketDetail from '@/components/help-desk/ticket-detail';

export default async function HelpDeskTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetail ticketId={id} />;
}
