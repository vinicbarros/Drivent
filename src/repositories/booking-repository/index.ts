import { prisma } from "@/config";

async function findBookingByUserId(userId: number) {
  return await prisma.booking.findFirst({
    where: {
      userId,
    },
  });
}

async function countBookingByRoomId(roomId: number) {
  return await prisma.booking.findMany({
    where: {
      roomId,
    },
  });
}

async function postBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}

const bookingRepository = {
  findBookingByUserId,
  countBookingByRoomId,
  postBooking,
};

export default bookingRepository;
