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

export async function createRooms(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.company.companyName(),
      capacity: faker.datatype.number(80),
      hotelId,
    },
  });
}
