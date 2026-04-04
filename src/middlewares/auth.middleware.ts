import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { verifyAccessToken } from "../utils/jwt";

const getBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  return token;
};

export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const token = getBearerToken(req.header("authorization"));

  if (!token) {
    throw new ApiError(401, "Access token is required");
  }

  let payload: { id: string; role: "USER" | "ADMIN" | "AGENT" };
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  req.user = {
    ...user,
    role: payload.role,
  };
  next();
};

export const authorizeRoles =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden: insufficient permissions");
    }

    next();
  };
