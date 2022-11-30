import { notFoundError } from "@/errors";
import { forbiddenError } from "@/errors/forbidden-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketsRepository from "@/repositories/ticket-repository";

export async function validateTicketType(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  if (ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }
}
