import { notFoundError } from "@/errors";
import { badRequestError } from "@/errors/bad-request-error";
import { forbiddenError } from "@/errors/forbidden-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelsRepository from "@/repositories/hotels-repository";
import ticketsRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
  const enrollmentId = (await userEnrollment(userId)).id;
  await checkPaidTicket(enrollmentId);

  const hotels = await hotelsRepository.findHotels();

  return hotels;
}

async function getRooms(hotelId: number, userId: number) {
  if (!hotelId || isNaN(hotelId)) throw badRequestError();

  const enrollmentId = (await userEnrollment(userId)).id;
  await checkPaidTicket(enrollmentId);

  const hotel = await hotelsRepository.findHotelById(hotelId);

  if (!hotel) throw notFoundError();

  const rooms = await hotelsRepository.findRooms(hotelId);

  return rooms;
}

async function checkPaidTicket(enrollmentId: number) {
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollmentId);

  if (!ticket) throw notFoundError();

  if (ticket.status !== "PAID" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw forbiddenError();
}

async function userEnrollment(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw notFoundError();

  return enrollment;
}

const hotelsService = {
  getHotels,
  getRooms,
  checkPaidTicket,
  userEnrollment,
};

export default hotelsService;
