import { Request, Response } from "express";
import { cancelBooking, confirmBooking, createBooking, getUserBookings } from "../services/booking.service";
import { ApiError } from "../utils/api-error";
import { createResponse } from "../utils/api-response";

interface CreateBookingBody {
  propertyId?: string;
  date?: string;
}

export const bookingController = {
  create: async (req: Request<unknown, unknown, CreateBookingBody>, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { propertyId, date } = req.body;

    if (!propertyId || !date) {
      throw new ApiError(400, "propertyId and date are required");
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new ApiError(400, "Invalid date format. Use ISO date string.");
    }

    const booking = await createBooking({ propertyId, date: parsedDate }, req.user.id);
    res.status(201).json(createResponse("Property booked successfully", booking));
  },

  cancel: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    await cancelBooking(req.params.id, { id: req.user.id, role: req.user.role });
    res.status(200).json(createResponse("Booking cancelled successfully"));
  },

  confirm: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const booking = await confirmBooking(req.params.id);
    res.status(200).json(createResponse("Booking confirmed successfully", booking));
  },

  getMine: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const bookings = await getUserBookings(req.user.id);
    res.status(200).json(createResponse("User bookings fetched successfully", bookings));
  },
};
