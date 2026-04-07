import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";

export const getUserProfile = async (userId: string) => {
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

  return user;
};

interface UpdateUserProfileInput {
  name?: string;
  email?: string;
  phone?: string | null;
}

export const updateUserProfile = async (userId: string, payload: UpdateUserProfileInput) => {
  const data: UpdateUserProfileInput = {};

  if (payload.name !== undefined) {
    const trimmedName = payload.name.trim();
    if (!trimmedName) {
      throw new ApiError(400, "name cannot be empty");
    }
    data.name = trimmedName;
  }

  if (payload.email !== undefined) {
    const trimmedEmail = payload.email.trim().toLowerCase();
    if (!trimmedEmail) {
      throw new ApiError(400, "email cannot be empty");
    }
    data.email = trimmedEmail;
  }

  if (payload.phone !== undefined) {
    data.phone = payload.phone?.trim() || null;
  }

  if (Object.keys(data).length === 0) {
    throw new ApiError(400, "At least one profile field is required");
  }

  try {
    return await prisma.user.update({
      where: { id: userId },
      data,
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
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      throw new ApiError(409, "Email is already in use");
    }

    throw error;
  }
};

export const saveUserFavorite = async (userId: string, propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
    select: { id: true },
  });

  if (existingFavorite) {
    throw new ApiError(409, "Property already saved in favorites");
  }

  return prisma.favorite.create({
    data: {
      userId,
      propertyId,
    },
    select: {
      id: true,
      propertyId: true,
      createdAt: true,
      property: {
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
      },
    },
  });
};

export const removeUserFavorite = async (userId: string, propertyId: string) => {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
    select: { id: true },
  });

  if (!favorite) {
    throw new ApiError(404, "Favorite not found");
  }

  await prisma.favorite.delete({
    where: { id: favorite.id },
  });
};

export const getUserFavorites = async (userId: string) => {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      propertyId: true,
      createdAt: true,
      property: {
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
      },
    },
  });
};
