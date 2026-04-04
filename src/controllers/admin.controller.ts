import { BookingStatus, UserRole } from "@prisma/client";
import { Request, Response } from "express";
import {
  deleteAdminProperty,
  deleteAdminUser,
  getAdminBookings,
  getAdminProperties,
  getAdminStats,
  getAdminUsers,
  updateAdminUserRole,
} from "../services/admin.service";
import { ApiError } from "../utils/api-error";
import { createResponse } from "../utils/api-response";

interface AdminQuery {
  page?: string;
  limit?: string;
  status?: string;
}

interface UpdateUserRoleBody {
  role?: string;
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

const parseUserRole = (role?: string): UserRole => {
  if (role !== UserRole.USER && role !== UserRole.ADMIN && role !== UserRole.AGENT) {
    throw new ApiError(400, "role must be USER, ADMIN or AGENT");
  }

  return role;
};

export const adminController = {
  stats: async (_req: Request, res: Response): Promise<void> => {
    const stats = await getAdminStats();
    res.status(200).json(createResponse("Admin stats fetched successfully", stats));
  },

  users: async (req: Request<unknown, unknown, unknown, AdminQuery>, res: Response): Promise<void> => {
    const page = parsePositiveNumber(req.query.page, 1);
    const limit = Math.min(parsePositiveNumber(req.query.limit, 10), 100);

    const users = await getAdminUsers({ page, limit });
    res.status(200).json(createResponse("Admin users fetched successfully", users));
  },

  deleteUser: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    await deleteAdminUser(req.params.id, req.user.id);
    res.status(200).json(createResponse("User deleted successfully"));
  },

  updateUserRole: async (req: Request<{ id: string }, unknown, UpdateUserRoleBody>, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const role = parseUserRole(req.body.role);
    const user = await updateAdminUserRole(req.params.id, role, req.user.id);
    res.status(200).json(createResponse("User role updated successfully", user));
  },

  properties: async (req: Request<unknown, unknown, unknown, AdminQuery>, res: Response): Promise<void> => {
    const page = parsePositiveNumber(req.query.page, 1);
    const limit = Math.min(parsePositiveNumber(req.query.limit, 10), 100);

    const properties = await getAdminProperties({ page, limit });
    res.status(200).json(createResponse("Admin properties fetched successfully", properties));
  },

  deleteProperty: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    await deleteAdminProperty(req.params.id);
    res.status(200).json(createResponse("Property deleted successfully"));
  },

  bookings: async (req: Request<unknown, unknown, unknown, AdminQuery>, res: Response): Promise<void> => {
    const page = parsePositiveNumber(req.query.page, 1);
    const limit = Math.min(parsePositiveNumber(req.query.limit, 10), 100);
    const status = parseBookingStatus(req.query.status);

    const bookings = await getAdminBookings({ page, limit, status });
    res.status(200).json(createResponse("Admin bookings fetched successfully", bookings));
  },
};
