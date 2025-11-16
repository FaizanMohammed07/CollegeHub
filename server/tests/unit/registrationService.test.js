/**
 * Unit Tests for Registration Service - Concurrent Registration
 */
import registrationService from "../src/services/registrationService.js";
import registrationRepository from "../src/repositories/registrationRepository.js";
import eventRepository from "../src/repositories/eventRepository.js";
import userRepository from "../src/repositories/userRepository.js";
import mapService from "../src/services/mapService.js";
import { AppError, ERROR_CODES } from "../src/utils/AppError.js";

jest.mock("../src/repositories/registrationRepository.js");
jest.mock("../src/repositories/eventRepository.js");
jest.mock("../src/repositories/userRepository.js");
jest.mock("../src/services/mapService.js");

describe("RegistrationService - Concurrency Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("registerForEvent - Capacity Enforcement", () => {
    it("should prevent registration when capacity is reached", async () => {
      const mockEvent = {
        _id: "event123",
        capacity: 10,
        attendeesCount: 10, // At capacity
        status: "published",
        startAt: new Date(Date.now() + 86400000), // Tomorrow
        endAt: new Date(Date.now() + 90000000),
        location: { coords: { coordinates: [0, 0] } },
      };

      const mockUser = {
        _id: "user123",
        blocked: false,
      };

      eventRepository.findById.mockResolvedValue(mockEvent);
      userRepository.findById.mockResolvedValue(mockUser);
      registrationRepository.findByEventAndUser.mockResolvedValue(null);

      await expect(
        registrationService.registerForEvent("event123", "user123", {})
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.CAPACITY_EXCEEDED,
        })
      );
    });

    it("should handle duplicate registration attempts with unique index", async () => {
      const mockEvent = {
        _id: "event123",
        capacity: 100,
        attendeesCount: 5,
        status: "published",
        startAt: new Date(Date.now() + 86400000),
        endAt: new Date(Date.now() + 90000000),
        location: { coords: { coordinates: [0, 0] } },
      };

      const mockUser = {
        _id: "user123",
        blocked: false,
      };

      const mockRegistration = {
        _id: "reg123",
        eventId: "event123",
        userId: "user123",
        toObject: () => ({ _id: "reg123", status: "registered" }),
      };

      eventRepository.findById.mockResolvedValue(mockEvent);
      userRepository.findById.mockResolvedValue(mockUser);
      registrationRepository.findByEventAndUser.mockResolvedValue(null);
      registrationRepository.create.mockRejectedValueOnce({
        code: 11000, // Duplicate key error
      });

      await expect(
        registrationService.registerForEvent("event123", "user123", {})
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.ALREADY_REGISTERED,
        })
      );
    });

    it("should increment attendees atomically after successful registration", async () => {
      const mockEvent = {
        _id: "event123",
        capacity: 100,
        attendeesCount: 5,
        status: "published",
        startAt: new Date(Date.now() + 86400000),
        endAt: new Date(Date.now() + 90000000),
        location: { coords: { coordinates: [0, 0] } },
        isPaid: false,
      };

      const mockUser = {
        _id: "user123",
        blocked: false,
      };

      const mockRegistration = {
        _id: "reg123",
        eventId: "event123",
        userId: "user123",
        status: "registered",
        toObject: () => ({ _id: "reg123", status: "registered" }),
      };

      eventRepository.findById.mockResolvedValue(mockEvent);
      userRepository.findById.mockResolvedValue(mockUser);
      registrationRepository.findByEventAndUser.mockResolvedValue(null);
      registrationRepository.create.mockResolvedValue(mockRegistration);
      eventRepository.incrementAttendees.mockResolvedValue(mockEvent);

      const result = await registrationService.registerForEvent(
        "event123",
        "user123",
        {}
      );

      expect(registrationRepository.create).toHaveBeenCalled();
      expect(eventRepository.incrementAttendees).toHaveBeenCalledWith(
        "event123"
      );
      expect(result._id).toBe("reg123");
    });
  });

  describe("registerForEvent - ETA Computation", () => {
    it("should compute ETA if user provides coordinates", async () => {
      const mockEvent = {
        _id: "event123",
        capacity: 100,
        attendeesCount: 5,
        status: "published",
        startAt: new Date(Date.now() + 86400000), // Tomorrow
        endAt: new Date(Date.now() + 90000000),
        location: { coords: { coordinates: [0, 0] } },
        isPaid: false,
      };

      const mockUser = {
        _id: "user123",
        blocked: false,
      };

      const mockRegistration = {
        _id: "reg123",
        eventId: "event123",
        userId: "user123",
        status: "registered",
        toObject: () => ({ _id: "reg123" }),
      };

      const mockRouteData = {
        etaSeconds: 1800,
        distanceMeters: 10000,
        provider: "mapbox",
        reliabilityScore: 0.85,
        polyline: "polyline_data",
        providerMeta: {},
      };

      eventRepository.findById.mockResolvedValue(mockEvent);
      userRepository.findById.mockResolvedValue(mockUser);
      registrationRepository.findByEventAndUser.mockResolvedValue(null);
      registrationRepository.create.mockResolvedValue(mockRegistration);
      eventRepository.incrementAttendees.mockResolvedValue(mockEvent);
      mapService.validateCoordinates.mockImplementation(() => {});
      mapService.getRouteEstimate.mockResolvedValue(mockRouteData);
      registrationRepository.updateETA.mockResolvedValue(mockRegistration);

      const result = await registrationService.registerForEvent(
        "event123",
        "user123",
        {
          userCoordinates: { lat: 40.7128, lng: -74.006 },
        }
      );

      expect(mapService.getRouteEstimate).toHaveBeenCalled();
      expect(registrationRepository.updateETA).toHaveBeenCalled();
    });
  });

  describe("checkInUser", () => {
    it("should check in user successfully", async () => {
      const mockRegistration = {
        _id: "reg123",
        userId: "user123",
        eventId: "event123",
        status: "registered",
      };

      const mockUpdated = {
        ...mockRegistration,
        status: "checked-in",
        checkedInAt: new Date(),
      };

      registrationRepository.findById.mockResolvedValue(mockRegistration);
      registrationRepository.updateStatus.mockResolvedValue(mockUpdated);

      const result = await registrationService.checkInUser("reg123", {
        checkedInBy: "admin123",
      });

      expect(registrationRepository.updateStatus).toHaveBeenCalledWith(
        "reg123",
        "checked-in",
        expect.any(Object)
      );
      expect(result.status).toBe("checked-in");
    });

    it("should prevent check-in if already checked in", async () => {
      const mockRegistration = {
        _id: "reg123",
        status: "checked-in",
        checkedInAt: new Date(),
      };

      registrationRepository.findById.mockResolvedValue(mockRegistration);

      await expect(
        registrationService.checkInUser("reg123", { checkedInBy: "admin123" })
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.CONFLICT,
        })
      );
    });
  });

  describe("cancelRegistration", () => {
    it("should cancel registration and decrement attendees", async () => {
      const mockRegistration = {
        _id: "reg123",
        userId: "user123",
        eventId: "event123",
        status: "registered",
        paymentStatus: "pending",
      };

      const mockUpdated = {
        ...mockRegistration,
        status: "cancelled",
        cancelledAt: new Date(),
      };

      registrationRepository.findById.mockResolvedValue(mockRegistration);
      registrationRepository.updateStatus.mockResolvedValue(mockUpdated);
      eventRepository.decrementAttendees.mockResolvedValue({});

      const result = await registrationService.cancelRegistration(
        "reg123",
        "user123",
        "User cancelled"
      );

      expect(registrationRepository.updateStatus).toHaveBeenCalled();
      expect(eventRepository.decrementAttendees).toHaveBeenCalledWith(
        "event123"
      );
      expect(result.status).toBe("cancelled");
    });

    it("should prevent cancellation after check-in", async () => {
      const mockRegistration = {
        _id: "reg123",
        userId: "user123",
        status: "checked-in",
      };

      registrationRepository.findById.mockResolvedValue(mockRegistration);

      await expect(
        registrationService.cancelRegistration("reg123", "user123")
      ).rejects.toThrow(
        expect.objectContaining({
          code: ERROR_CODES.CONFLICT,
        })
      );
    });
  });
});
