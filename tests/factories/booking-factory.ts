import { prisma } from "@/config";
import { createRooms } from "./hotels-factory";
import { createUser } from "./users-factory";

export async function createBooking({ userId, roomId }: BookingParams) {
  const incomingUserId = userId || (await createUser()).id;
  const incomingRoomId = roomId || (await createRooms()).id;

  return await prisma.booking.create({
    data: {
      userId: incomingUserId,
      roomId: incomingRoomId,
    },
  });
}

interface BookingParams {
  userId?: number;
  roomId?: number;
}
