import { notFoundError } from "@/errors";
import ticketsRepository from "@/repositories/ticket-repository";

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

async function getTicketTypeById(ticketId: number) {
  const ticket = await ticketsRepository.findTicketTypeById(ticketId);

  return ticket;
}

async function insertNewTicket(enrollmentId: number, ticketTypeId: number) {
  const newTicket = await ticketsRepository.createNewTicket(enrollmentId, ticketTypeId);

  return newTicket;
}

const ticketsService = {
  getTicketsTypes,
  getTickets,
  getTicketTypeById,
  insertNewTicket,
};

export default ticketsService;
