import { notFoundError } from "@/errors";
import { forbiddenError } from "@/errors/forbidden-error";
import bookingRepository from "@/repositories/booking-repository";
import hotelsRepository from "@/repositories/hotels-repository";
import hotelsService from "../hotels-service";

async function getBooking(userId: number) {
  const enrollmentId = (await hotelsService.userEnrollment(userId)).id;
  await hotelsService.checkPaidTicket(enrollmentId);

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
  const enrollmentId = (await hotelsService.userEnrollment(userId)).id;
  await hotelsService.checkPaidTicket(enrollmentId);

  const room = await hotelsRepository.findRoom(roomId);

  if (!room) throw notFoundError();

  await checkRoomIsAvailable(room.id, room.capacity);

  const bookingCreated = await bookingRepository.postBooking(userId, roomId);

  return {
    bookingId: bookingCreated.id,
  };
}

async function checkRoomIsAvailable(roomId: number, capacity: number) {
  const bookings = await bookingRepository.countBookingByRoomId(roomId);

  if (bookings.length === capacity) throw forbiddenError();
}

const bookingService = {
  getBooking,
  postBooking,
};

export default bookingService;
