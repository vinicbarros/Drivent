import { getBooking, postBooking, updateBooking } from "@/controllers/booking-controller";
import { authenticateToken, validateBody, validateParams } from "@/middlewares";
import { bookingIdParams, roomIdBody } from "@/schemas/booking-schema";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getBooking)
  .post("/", validateBody(roomIdBody), postBooking)
  .put("/:bookingId", validateParams(bookingIdParams), validateBody(roomIdBody), updateBooking);

export { bookingRouter };
