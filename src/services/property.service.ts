import { Prisma, PropertyType, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";

export interface CreatePropertyInput {
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  city: string;
  country: string;
  address: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

export interface UpdatePropertyInput {
  title?: string;
  description?: string;
  price?: number;
  type?: PropertyType;
  city?: string;
  country?: string;
  address?: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

export interface PropertyQueryOptions {
  page: number;
  limit: number;
  type?: PropertyType;
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  search?: string;
}

interface Actor {
  id: string;
  role: UserRole;
}

const propertySelect = {
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
} as const;

export const createProperty = async (payload: CreatePropertyInput, ownerId: string) => {
  return prisma.property.create({
    data: {
      ...payload,
      price: new Prisma.Decimal(payload.price),
      ownerId,
    },
    select: propertySelect,
  });
};

export const getPropertyById = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: propertySelect,
  });

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  return property;
};

export const getProperties = async (options: PropertyQueryOptions) => {
  const skip = (options.page - 1) * options.limit;

  const where: Prisma.PropertyWhereInput = {
    ...(options.type ? { type: options.type } : {}),
    ...(options.city ? { city: { equals: options.city, mode: "insensitive" } } : {}),
    ...(options.country ? { country: { equals: options.country, mode: "insensitive" } } : {}),
    ...(typeof options.bedrooms === "number" ? { bedrooms: { gte: options.bedrooms } } : {}),
    ...(typeof options.bathrooms === "number" ? { bathrooms: { gte: options.bathrooms } } : {}),
    ...(typeof options.minPrice === "number" || typeof options.maxPrice === "number"
      ? {
          price: {
            ...(typeof options.minPrice === "number" ? { gte: new Prisma.Decimal(options.minPrice) } : {}),
            ...(typeof options.maxPrice === "number" ? { lte: new Prisma.Decimal(options.maxPrice) } : {}),
          },
        }
      : {}),
    ...(options.search
      ? {
          OR: [
            { title: { contains: options.search, mode: "insensitive" } },
            { description: { contains: options.search, mode: "insensitive" } },
            { city: { contains: options.search, mode: "insensitive" } },
            { country: { contains: options.search, mode: "insensitive" } },
            { address: { contains: options.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: options.limit,
      orderBy: { createdAt: "desc" },
      select: propertySelect,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    data: properties,
    pagination: {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.max(1, Math.ceil(total / options.limit)),
      hasNextPage: skip + properties.length < total,
    },
  };
};

export const updateProperty = async (propertyId: string, payload: UpdatePropertyInput, actor: Actor) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, ownerId: true },
  });

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  const canManage = actor.role === UserRole.ADMIN || property.ownerId === actor.id;
  if (!canManage) {
    throw new ApiError(403, "Forbidden: you cannot update this property");
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      ...payload,
      ...(typeof payload.price === "number" ? { price: new Prisma.Decimal(payload.price) } : {}),
    },
    select: propertySelect,
  });
};

export const deleteProperty = async (propertyId: string, actor: Actor) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, ownerId: true },
  });

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  const canManage = actor.role === UserRole.ADMIN || property.ownerId === actor.id;
  if (!canManage) {
    throw new ApiError(403, "Forbidden: you cannot delete this property");
  }

  await prisma.property.delete({
    where: { id: propertyId },
  });
};

