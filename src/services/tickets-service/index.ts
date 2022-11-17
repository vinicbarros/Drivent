import { notFoundError } from "@/errors";
import ticketsRepository from "@/repositories/tickets-repository";

async function getTicketsTypes() {
  const ticketsTypes = await ticketsRepository.findTicketsTypes();

  return ticketsTypes;
}

async function getTickets(userId: number) {
  const tickets = await ticketsRepository.findTicketsByUserId(userId);

  if (tickets.length === 0) throw notFoundError();
  if (tickets.length === 1) return tickets[0];

  return tickets;
}

const ticketsService = {
  getTicketsTypes,
  getTickets,
};

export default ticketsService;
