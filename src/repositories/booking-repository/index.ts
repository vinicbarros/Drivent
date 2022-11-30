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

async function findBookingById(id: number) {
  return await prisma.booking.findUnique({
    where: {
      id,
    },
  });
}

async function updateBooking(id: number, roomId: number) {
  return await prisma.booking.update({
    where: {
      id,
    },
    data: {
      roomId,
    },
  });
}

const bookingRepository = {
  findBookingByUserId,
  countBookingByRoomId,
  postBooking,
  findBookingById,
  updateBooking,
};

export default bookingRepository;
