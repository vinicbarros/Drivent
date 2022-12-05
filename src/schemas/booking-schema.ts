import Joi from "joi";

export const roomIdBody = Joi.object<RoomIdType>({
  roomId: Joi.number().integer().positive().required(),
});

export const bookingIdParams = Joi.object<BookingIdType>({
  bookingId: Joi.number().integer().positive().required(),
});

type RoomIdType = {
  roomId: number;
};

type BookingIdType = {
  bookingId: number;
};
