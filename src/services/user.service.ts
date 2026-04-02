import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role?: "USER" | "ADMIN" | "AGENT";
  phone?: string;
}

export const createUser = async (payload: CreateUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  return prisma.user.create({
    data: {
      email: payload.email,
      name: payload.name,
      password: payload.password,
      role: payload.role,
      phone: payload.phone,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
