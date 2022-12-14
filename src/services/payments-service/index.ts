import { notFoundError, unauthorizedError } from "@/errors";
import { badRequestError } from "@/errors/bad-request-error";
import { CardData } from "@/protocols";
import paymentsRepository from "@/repositories/payment-repository";
import ticketsRepository from "@/repositories/ticket-repository";

async function getPaymentsByTicketId(ticketId: number, userId: number) {
  if (!ticketId) throw badRequestError();

  await handleTicketsValidation(ticketId, userId);

  const payment = await paymentsRepository.findPaymentsByTicketId(ticketId);

  return payment;
}

async function insertNewPayment(ticketId: number, userId: number, cardData: CardData) {
  if (!ticketId || !cardData) throw badRequestError();

  const { ticket, ticketType } = await handleTicketsValidation(ticketId, userId);

  const newPayment = await paymentsRepository.createNewPayment(ticket, cardData, ticketType);
  await ticketsRepository.updateTicketStatus(ticketId);

  return newPayment;
}

async function handleTicketsValidation(ticketId: number, userId: number) {
  const ticket = await ticketsRepository.findTicketById(ticketId);
  if (!ticket) throw notFoundError();

  const userOwnTicket = await ticketsRepository.findTicketsByTicketIdAndUserId(ticketId, userId);
  if (!userOwnTicket) throw unauthorizedError();

  const ticketType = await ticketsRepository.findTicketTypeById(ticket.ticketTypeId);
  const ticketData = {
    ticket,
    ticketType,
  };
  return ticketData;
}

const paymentsService = {
  getPaymentsByTicketId,
  insertNewPayment,
};

export default paymentsService;
