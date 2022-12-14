import { prisma } from "@/config";
import { TicketStatus } from "@prisma/client";

async function findTicketsTypes() {
  return await prisma.ticketType.findMany({});
}

async function findTicketsByUserId(userId: number) {
  return await prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId: userId,
      },
    },
    include: {
      TicketType: true,
    },
  });
}

async function findTicketTypeById(ticketId: number) {
  return await prisma.ticketType.findFirst({
    where: {
      id: ticketId,
    },
  });
}

async function createNewTicket(enrollmentId: number, ticketTypeId: number) {
  return await prisma.ticket.create({
    data: {
      ticketTypeId,
      enrollmentId,
      status: TicketStatus.RESERVED,
    },
  });
}

async function findTicketsByTicketIdAndUserId(ticketId: number, userId: number) {
  return await prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId,
      },
      id: ticketId,
    },
  });
}

async function findTicketById(id: number) {
  return await prisma.ticket.findFirst({
    where: {
      id,
    },
  });
}

async function updateTicketStatus(id: number) {
  return await prisma.ticket.update({
    where: {
      id,
    },
    data: {
      status: TicketStatus.PAID,
    },
  });
}

async function findTicketByEnrollmentId(enrollmentId: number) {
  return await prisma.ticket.findFirst({
    where: {
      enrollmentId,
    },
    include: {
      TicketType: true,
    },
  });
}

const ticketsRepository = {
  findTicketsTypes,
  findTicketsByUserId,
  findTicketTypeById,
  createNewTicket,
  findTicketsByTicketIdAndUserId,
  findTicketById,
  updateTicketStatus,
  findTicketByEnrollmentId,
};

export default ticketsRepository;
