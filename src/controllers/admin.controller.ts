import { BookingStatus } from "@prisma/client";
import { Request, Response } from "express";
import { getAdminBookings, getAdminProperties, getAdminUsers } from "../services/admin.service";
import { ApiError } from "../utils/api-error";
import { createResponse } from "../utils/api-response";

interface AdminQuery {
  page?: string;
  limit?: string;
  status?: string;
}

const parsePositiveNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBookingStatus = (status?: string): BookingStatus | undefined => {
  if (!status) return undefined;
  if (status !== BookingStatus.PENDING && status !== BookingStatus.CONFIRMED) {
    throw new ApiError(400, "status must be PENDING or CONFIRMED");
  }
  return status;
};

export const adminController = {
  users: async (req: Request<unknown, unknown, unknown, AdminQuery>, res: Response): Promise<void> => {
    const page = parsePositiveNumber(req.query.page, 1);
    const limit = Math.min(parsePositiveNumber(req.query.limit, 10), 100);

    const users = await getAdminUsers({ page, limit });
    res.status(200).json(createResponse("Admin users fetched successfully", users));
  },

  properties: async (req: Request<unknown, unknown, unknown, AdminQuery>, res: Response): Promise<void> => {
    const page = parsePositiveNumber(req.query.page, 1);
    const limit = Math.min(parsePositiveNumber(req.query.limit, 10), 100);

    const properties = await getAdminProperties({ page, limit });
    res.status(200).json(createResponse("Admin properties fetched successfully", properties));
  },

  bookings: async (req: Request<unknown, unknown, unknown, AdminQuery>, res: Response): Promise<void> => {
    const page = parsePositiveNumber(req.query.page, 1);
    const limit = Math.min(parsePositiveNumber(req.query.limit, 10), 100);
    const status = parseBookingStatus(req.query.status);

    const bookings = await getAdminBookings({ page, limit, status });
    res.status(200).json(createResponse("Admin bookings fetched successfully", bookings));
  },
};
