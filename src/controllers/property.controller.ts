import { PropertyType } from "@prisma/client";
import { Request, Response } from "express";
import {
  createProperty,
  deleteProperty,
  getMyProperties,
  getProperties,
  getPropertyById,
  updateProperty,
} from "../services/property.service";
import { ApiError } from "../utils/api-error";
import { createResponse } from "../utils/api-response";

interface PropertyBody {
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

interface PropertyQuery {
  page?: string;
  limit?: string;
  type?: string;
  city?: string;
  country?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  bathrooms?: string;
  search?: string;
}

const parsePositiveNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseOptionalNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseType = (type?: string): PropertyType | undefined => {
  if (!type) return undefined;
  if (type !== PropertyType.RENT && type !== PropertyType.SALE) {
    throw new ApiError(400, "type must be RENT or SALE");
  }
  return type;
};

const validateCreatePayload = (body: PropertyBody): Required<Omit<PropertyBody, "bedrooms" | "bathrooms" | "area">> & {
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
} => {
  const { title, description, price, type, city, country, address, images, bedrooms, bathrooms, area } = body;

  if (!title || !description || typeof price !== "number" || !type || !city || !country || !address || !Array.isArray(images)) {
    throw new ApiError(400, "title, description, price, type, city, country, address and images[] are required");
  }

  if (price <= 0) {
    throw new ApiError(400, "price must be greater than 0");
  }

  if (!images.every((img) => typeof img === "string")) {
    throw new ApiError(400, "images must be an array of strings");
  }

  return {
    title,
    description,
    price,
    type,
    city,
    country,
    address,
    images,
    bedrooms,
    bathrooms,
    area,
  };
};

export const propertyController = {
  getMine: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const properties = await getMyProperties(req.user.id);
    res.status(200).json(createResponse("Agent properties fetched successfully", properties));
  },

  create: async (req: Request<unknown, unknown, PropertyBody>, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const payload = validateCreatePayload(req.body);
    const property = await createProperty(payload, req.user.id);
    res.status(201).json(createResponse("Property created successfully", property));
  },

  update: async (req: Request<{ id: string }, unknown, PropertyBody>, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const propertyId = req.params.id;
    const payload = req.body;

    if (payload.price !== undefined && payload.price <= 0) {
      throw new ApiError(400, "price must be greater than 0");
    }

    if (payload.type && payload.type !== PropertyType.RENT && payload.type !== PropertyType.SALE) {
      throw new ApiError(400, "type must be RENT or SALE");
    }

    if (payload.images && (!Array.isArray(payload.images) || !payload.images.every((img) => typeof img === "string"))) {
      throw new ApiError(400, "images must be an array of strings");
    }

    const property = await updateProperty(propertyId, payload, { id: req.user.id, role: req.user.role });
    res.status(200).json(createResponse("Property updated successfully", property));
  },

  remove: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    await deleteProperty(req.params.id, { id: req.user.id, role: req.user.role });
    res.status(200).json(createResponse("Property deleted successfully"));
  },

  getOne: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const property = await getPropertyById(req.params.id);
    res.status(200).json(createResponse("Property fetched successfully", property));
  },

  getAll: async (req: Request<unknown, unknown, unknown, PropertyQuery>, res: Response): Promise<void> => {
    const page = parsePositiveNumber(req.query.page, 1);
    const limit = Math.min(parsePositiveNumber(req.query.limit, 10), 50);

    const result = await getProperties({
      page,
      limit,
      type: parseType(req.query.type),
      city: req.query.city,
      country: req.query.country,
      minPrice: parseOptionalNumber(req.query.minPrice),
      maxPrice: parseOptionalNumber(req.query.maxPrice),
      bedrooms: parseOptionalNumber(req.query.bedrooms),
      bathrooms: parseOptionalNumber(req.query.bathrooms),
      search: req.query.search,
    });

    res.status(200).json(createResponse("Properties fetched successfully", result));
  },
};
