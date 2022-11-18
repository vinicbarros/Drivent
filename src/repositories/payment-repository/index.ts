import { prisma } from "@/config";
import { CardData } from "@/protocols";
import { Ticket, TicketType } from "@prisma/client";

async function findPaymentsByTicketId(ticketId: number) {
  return await prisma.payment.findFirst({
    where: {
      Ticket: {
        id: ticketId,
      },
    },
  });
}

async function createNewPayment(ticket: Ticket, cardData: CardData, ticketType: TicketType) {
  return await prisma.payment.create({
    data: {
      ticketId: ticket.id,
      value: ticketType.price,
      cardIssuer: cardData.issuer,
      cardLastDigits: cardData.number.toString().slice(-4),
    },
  });
}

const paymentsRepository = {
  findPaymentsByTicketId,
  createNewPayment,
};

export default paymentsRepository;
