import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createHotels() {
  return prisma.hotel.create({
    data: {
      name: faker.commerce.productName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRooms(hotelId?: number) {
  const incomingHotelId = hotelId || (await createHotels()).id;

  return prisma.room.create({
    data: {
      name: faker.company.companyName(),
      capacity: faker.datatype.number({ min: 1, max: 4 }),
      hotelId: incomingHotelId,
    },
  });
}
