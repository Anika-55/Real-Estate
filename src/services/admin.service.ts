import { BookingStatus, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";

interface PaginationInput {
  page: number;
  limit: number;
}

interface BookingFilters {
  status?: BookingStatus;
}

const paginate = async <T>(args: {
  page: number;
  limit: number;
  fetchData: (skip: number, take: number) => Promise<T[]>;
  countAll: () => Promise<number>;
}) => {
  const skip = (args.page - 1) * args.limit;
  const [data, total] = await Promise.all([args.fetchData(skip, args.limit), args.countAll()]);

  return {
    data,
    pagination: {
      total,
      page: args.page,
      limit: args.limit,
      totalPages: Math.max(1, Math.ceil(total / args.limit)),
      hasNextPage: skip + data.length < total,
    },
  };
};

export const getAdminUsers = async (options: PaginationInput) => {
  return paginate({
    ...options,
    fetchData: (skip, take) =>
      prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    countAll: () => prisma.user.count(),
  });
};

export const deleteAdminUser = async (userId: string, adminId: string) => {
  if (userId === adminId) {
    throw new ApiError(400, "Admin cannot delete own account");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await prisma.user.delete({
    where: { id: userId },
  });
};

export const updateAdminUserRole = async (userId: string, role: UserRole, adminId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (userId === adminId && role !== UserRole.ADMIN) {
    throw new ApiError(400, "Admin cannot change own role to non-admin");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getAdminProperties = async (options: PaginationInput) => {
  return paginate({
    ...options,
    fetchData: (skip, take) =>
      prisma.property.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          type: true,
          city: true,
          country: true,
          address: true,
          images: true,
          bedrooms: true,
          bathrooms: true,
          area: true,
          ownerId: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
    countAll: () => prisma.property.count(),
  });
};


export const deleteAdminProperty = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  await prisma.property.delete({
    where: { id: propertyId },
  });
};
export const getAdminBookings = async (options: PaginationInput & BookingFilters) => {
  return paginate({
    ...options,
    fetchData: (skip, take) =>
      prisma.booking.findMany({
        where: options.status ? { status: options.status } : undefined,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          propertyId: true,
          date: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              country: true,
              address: true,
              type: true,
            },
          },
        },
      }),
    countAll: () => prisma.booking.count({ where: options.status ? { status: options.status } : undefined }),
  });
};


