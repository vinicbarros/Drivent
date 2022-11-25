import { notFoundError, unauthorizedError } from "@/errors";
import { badRequestError } from "@/errors/bad-request-error";
import hotelsRepository from "@/repositories/hotels-repository";
import ticketsRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
  await checkPaidTicket(userId);

  const hotels = await hotelsRepository.findHotels();

  return hotels;
}

async function getRooms(hotelId: number, userId: number) {
  if (!hotelId || isNaN(hotelId)) throw badRequestError();

  await checkPaidTicket(userId);

  const hotel = await hotelsRepository.findHotelById(hotelId);

  if (!hotel) throw notFoundError();

  const rooms = await hotelsRepository.findRooms(hotelId);

  return rooms;
}

async function checkPaidTicket(userId: number) {
  const ticket = await ticketsRepository.findTicketsByUserId(userId);

  if (!ticket) throw notFoundError();

  if (ticket.status !== "PAID" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw unauthorizedError();
}

const hotelsService = {
  getHotels,
  getRooms,
};

export default hotelsService;
