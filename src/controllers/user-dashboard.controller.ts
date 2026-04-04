import { Request, Response } from "express";
import { getUserBookings } from "../services/booking.service";
import { getUserFavorites, getUserProfile } from "../services/user-dashboard.service";
import { ApiError } from "../utils/api-error";
import { createResponse } from "../utils/api-response";

export const userDashboardController = {
  bookings: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const bookings = await getUserBookings(req.user.id);
    res.status(200).json(createResponse("User bookings fetched successfully", bookings));
  },

  favorites: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const favorites = await getUserFavorites(req.user.id);
    res.status(200).json(createResponse("User favorites fetched successfully", favorites));
  },

  profile: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const profile = await getUserProfile(req.user.id);
    res.status(200).json(createResponse("User profile fetched successfully", profile));
  },
};
