import app, { init } from "@/app";
import * as jwt from "jsonwebtoken";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser } from "../factories";
import { createHotels, createRooms } from "../factories/hotels-factory";
import { TicketStatus } from "@prisma/client";
import { createBooking } from "../factories/booking-factory";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(401);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if the user doesn't have a enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 if the user doesn't have a ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 if the ticket isn't paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 401 if the TicketType is remote", async () => {
      const includesHotel = false;
      const isRemote = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 401 if the TicketType doesn't includes hotel", async () => {
      const includesHotel = false;
      const isRemote = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.FORBIDDEN);
    });
    describe("when TicketType is valid", () => {
      it("should respond with status 404 when the user doesn't have a booking", async () => {
        const includesHotel = true;
        const isRemote = false;
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(includesHotel, isRemote);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 200, bookingId and existing room data", async () => {
        const includesHotel = true;
        const isRemote = false;
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(includesHotel, isRemote);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const hotel = await createHotels();
        const room = await createRooms(hotel.id);
        const params = {
          userId: user.id,
          roomId: room.id,
        };
        const booking = await createBooking(params);

        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          id: booking.id,
          Room: {
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString(),
          },
        });
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(401);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 if body param roomId is missing", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({});

      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 404 if the user doesn't have a enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const body = { roomId: 1 };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 if the user doesn't have a ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const body = { roomId: 1 };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 if the ticket isn't paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const body = { roomId: 1 };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.statusCode).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 401 if the TicketType is remote", async () => {
      const includesHotel = false;
      const isRemote = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const body = { roomId: 1 };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.statusCode).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 401 if the TicketType doesn't includes hotel", async () => {
      const includesHotel = false;
      const isRemote = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const body = { roomId: 1 };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.statusCode).toBe(httpStatus.FORBIDDEN);
    });
    describe("when TicketType is valid", () => {
      it("should respond with status 404 if the roomId doesn't exist", async () => {
        const includesHotel = true;
        const isRemote = false;
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(includesHotel, isRemote);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const body = { roomId: 1 };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 403 if the room is full", async () => {
        const includesHotel = true;
        const isRemote = false;
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(includesHotel, isRemote);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const hotel = await createHotels();
        const room = await createRooms(hotel.id);
        for (let i = 0; i < room.capacity; i++) {
          const roomId = room.id;
          await createBooking({ roomId });
        }

        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.statusCode).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 200 if the room is available and with bookingId created", async () => {
        const includesHotel = true;
        const isRemote = false;
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(includesHotel, isRemote);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const hotel = await createHotels();
        const room = await createRooms(hotel.id);

        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.statusCode).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          bookingId: expect.any(Number),
        });
      });
    });
  });
});
