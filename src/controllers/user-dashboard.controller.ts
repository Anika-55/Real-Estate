import { Request, Response } from "express";
import { getUserBookings } from "../services/booking.service";
import { getUserFavorites, getUserProfile, removeUserFavorite, saveUserFavorite } from "../services/user-dashboard.service";
import { ApiError } from "../utils/api-error";
import { createResponse } from "../utils/api-response";

interface SaveFavoriteBody {
  propertyId?: string;
}

export const userDashboardController = {
  bookings: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const bookings = await getUserBookings(req.user.id);
    res.status(200).json(createResponse("User bookings fetched successfully", bookings));
  },

  saveFavorite: async (req: Request<unknown, unknown, SaveFavoriteBody>, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { propertyId } = req.body;
    if (!propertyId) {
      throw new ApiError(400, "propertyId is required");
    }

    const favorite = await saveUserFavorite(req.user.id, propertyId);
    res.status(201).json(createResponse("Property saved to favorites", favorite));
  },

  removeFavorite: async (req: Request<{ propertyId: string }>, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    await removeUserFavorite(req.user.id, req.params.propertyId);
    res.status(200).json(createResponse("Property removed from favorites"));
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
