import { prisma } from "@/config";

async function findHotels() {
  return await prisma.hotel.findMany({});
}

async function findRooms(hotelId: number) {
  return await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

async function findRoom(id: number) {
  return await prisma.room.findFirst({
    where: {
      id,
    },
  });
}

async function findHotelById(hotelId: number) {
  return await prisma.hotel.findUnique({
    where: {
      id: hotelId,
    },
  });
}

const hotelsRepository = {
  findHotels,
  findRooms,
  findHotelById,
  findRoom,
};

export default hotelsRepository;
