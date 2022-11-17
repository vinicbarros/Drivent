import { prisma } from "@/config";

async function findTicketsTypes() {
  return await prisma.ticketType.findMany({});
}

async function findTicketsByUserId(userId: number) {
  return await prisma.ticket.findMany({
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

const ticketsRepository = {
  findTicketsTypes,
  findTicketsByUserId,
};

export default ticketsRepository;
