import { prisma } from "@/config";
import { createUser } from "./users-factory";

export async function createBooking(userId: number, roomId: number) {
  const incomingUserId = userId || (await createUser()).id;

  return await prisma.booking.create({
    data: {
      userId: incomingUserId,
      roomId,
    },
  });
}
