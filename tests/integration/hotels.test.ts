import app, { init } from "@/app";
import * as jwt from "jsonwebtoken";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { createHotels, createRooms } from "../factories/hotels-factory";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(401);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("When token is valid", () => {
    it("should respond with status 401 if the user doesn't have a ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 if the ticket isn't paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if the TicketType is remote", async () => {
      const includesHotel = false;
      const isRemote = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if the TicketType doesn't includes hotel ", async () => {
      const includesHotel = false;
      const isRemote = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with empty array when there are no hotels created", async () => {
      const includesHotel = true;
      const isRemote = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.body).toEqual([]);
    });

    it("should respond with status 200 and with existing hotels data", async () => {
      const includesHotel = true;
      const isRemote = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotels();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString(),
          }),
        ]),
      );
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/:hotelId");

    expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels/:hotelId").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(401);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels/:hotelId").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("When token is valid", () => {
    it("should respond with status 401 if the user doesn't have a ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const number = faker.datatype.number(50);

      const response = await server.get(`/hotels/${number}`).set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 if the ticket isn't paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const number = faker.datatype.number(50);

      const response = await server.get(`/hotels/${number}`).set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if the TicketType is remote", async () => {
      const includesHotel = false;
      const isRemote = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const number = faker.datatype.number(50);

      const response = await server.get(`/hotels/${number}`).set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if the TicketType doesn't includes hotel ", async () => {
      const includesHotel = false;
      const isRemote = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const number = faker.datatype.number(50);

      const response = await server.get(`/hotels/${number}`).set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 400 if the params isn't a number", async () => {
      const includesHotel = true;
      const isRemote = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const word = faker.name.firstName();

      const response = await server.get(`/hotels/${word}`).set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 if the hotelId isn't valid", async () => {
      const includesHotel = true;
      const isRemote = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const number = faker.datatype.number(50);

      const response = await server.get(`/hotels/${number}`).set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with empty array when there are no rooms available", async () => {
      const includesHotel = true;
      const isRemote = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotels();

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.body).toEqual({
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [],
      });
    });

    it("should respond with status 200 when are rooms available", async () => {
      const includesHotel = true;
      const isRemote = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(includesHotel, isRemote);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotels();
      const room = await createRooms(hotel.id);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [
          {
            id: room.id,
            hotelId: room.hotelId,
            name: room.name,
            capacity: room.capacity,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString(),
          },
        ],
      });
    });
  });
});
