import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import bookingService from "@/services/booking-service";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBooking(userId);
    return res.send(booking).status(httpStatus.OK);
  } catch (error) {
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === "UnauthorizedError") return res.sendStatus(httpStatus.UNAUTHORIZED);
    if (error.name === "ForbiddenError") return res.sendStatus(httpStatus.FORBIDDEN);
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    const bookingIdCreated = await bookingService.postBooking(userId, roomId);
    return res.send(bookingIdCreated).status(httpStatus.OK);
  } catch (error) {
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === "UnauthorizedError") return res.sendStatus(httpStatus.UNAUTHORIZED);
    if (error.name === "ForbiddenError") return res.sendStatus(httpStatus.FORBIDDEN);
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
