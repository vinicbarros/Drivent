import { notFoundError, unauthorizedError } from "@/errors";
import { badRequestError } from "@/errors/bad-request-error";
import { forbiddenError } from "@/errors/forbidden-error";
import bookingRepository from "@/repositories/booking-repository";
import hotelsRepository from "@/repositories/hotels-repository";
import { validateTicketType } from "@/utils/ticket-type-helper";

async function getBooking(userId: number) {
  await validateTicketType(userId);

  const booking = await bookingRepository.findBookingByUserId(userId);
  if (!booking) throw notFoundError();

  const room = await hotelsRepository.findRoom(booking.roomId);

  return {
    id: booking.id,
    Room: {
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      hotelId: room.hotelId,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    },
  };
}

async function postBooking(userId: number, roomId: number) {
  if (!roomId) throw notFoundError();
  await validateTicketType(userId);

  const room = await hotelsRepository.findRoom(roomId);
  if (!room) throw notFoundError();

  await checkRoomIsAvailable(room.id, room.capacity);
  const bookingCreated = await bookingRepository.postBooking(userId, roomId);

  return {
    bookingId: bookingCreated.id,
  };
}

async function putBooking(userId: number, roomId: number, bookingId: number) {
  if (!roomId) throw notFoundError();
  await validateTicketType(userId);
  if (!bookingId || isNaN(bookingId)) throw badRequestError();

  const booking = await bookingRepository.findBookingById(bookingId);
  if (!booking) throw notFoundError();
  if (booking.userId !== userId) throw unauthorizedError();

  const room = await hotelsRepository.findRoom(roomId);
  if (!room) throw notFoundError();

  await checkRoomIsAvailable(room.id, room.capacity);
  const bookingUpdated = await bookingRepository.updateBooking(bookingId, roomId);

  return {
    bookingId: bookingUpdated.id,
  };
}

async function checkRoomIsAvailable(roomId: number, capacity: number) {
  const bookings = await bookingRepository.countBookingByRoomId(roomId);

  if (bookings.length === capacity) throw forbiddenError();
}

const bookingService = {
  getBooking,
  postBooking,
  putBooking,
};

export default bookingService;
