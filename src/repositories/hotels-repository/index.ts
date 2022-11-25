import { prisma } from "@/config";

async function findHotels() {
  return await prisma.hotel.findMany({});
}

async function findRooms(hotelId: number) {
  return await prisma.room.findMany({
    where: {
      hotelId,
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
};

export default hotelsRepository;
