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
