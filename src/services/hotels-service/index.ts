import { notFoundError } from "@/errors";
import { badRequestError } from "@/errors/bad-request-error";
import hotelsRepository from "@/repositories/hotels-repository";
import { validateTicketType } from "@/utils/ticket-type-helper";

async function getHotels(userId: number) {
  await validateTicketType(userId);

  const hotels = await hotelsRepository.findHotels();

  return hotels;
}

async function getRooms(hotelId: number, userId: number) {
  if (!hotelId || isNaN(hotelId)) throw badRequestError();

  await validateTicketType(userId);

  const hotel = await hotelsRepository.findHotelById(hotelId);

  if (!hotel) throw notFoundError();

  const rooms = await hotelsRepository.findRooms(hotelId);

  return rooms;
}

const hotelsService = {
  getHotels,
  getRooms,
};

export default hotelsService;
