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
  price?: number | string;
  type?: PropertyType | string;
  city?: string;
  country?: string;
  address?: string;
  images?: string[] | string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  area?: number | string;
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

const parseNumberField = (value: unknown, field: string): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ApiError(400, `${field} must be a valid number`);
  }
  return parsed;
};

const parseType = (type?: string): PropertyType | undefined => {
  if (!type) return undefined;
  if (type !== PropertyType.RENT && type !== PropertyType.SALE) {
    throw new ApiError(400, "type must be RENT or SALE");
  }
  return type;
};

const parseImagesFromBody = (images: unknown): string[] => {
  if (!images) return [];

  if (Array.isArray(images)) {
    return images.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof images === "string") {
    const trimmed = images.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
        }
      } catch {
        throw new ApiError(400, "images must be a valid JSON string array");
      }
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  throw new ApiError(400, "images must be an array of strings");
};

const mergeImageUrls = (bodyImages: unknown, uploadedImages?: string[]): string[] => {
  const raw = [...parseImagesFromBody(bodyImages), ...(uploadedImages ?? [])];
  return Array.from(new Set(raw));
};

const validateCreatePayload = (body: PropertyBody, uploadedImages?: string[]) => {
  const title = body.title;
  const description = body.description;
  const type = parseType(typeof body.type === "string" ? body.type : body.type);
  const price = parseNumberField(body.price, "price");
  const bedrooms = parseNumberField(body.bedrooms, "bedrooms");
  const bathrooms = parseNumberField(body.bathrooms, "bathrooms");
  const area = parseNumberField(body.area, "area");
  const images = mergeImageUrls(body.images, uploadedImages);

  if (!title || !description || price === undefined || !type || !body.city || !body.country || !body.address) {
    throw new ApiError(400, "title, description, price, type, city, country and address are required");
  }

  if (price <= 0) {
    throw new ApiError(400, "price must be greater than 0");
  }

  if (!images.length) {
    throw new ApiError(400, "At least one image is required");
  }

  return {
    title,
    description,
    price,
    type,
    city: body.city,
    country: body.country,
    address: body.address,
    images,
    bedrooms,
    bathrooms,
    area,
  };
};

const normalizeUpdatePayload = (body: PropertyBody, uploadedImages?: string[]) => {
  const payload = {
    title: body.title,
    description: body.description,
    price: parseNumberField(body.price, "price"),
    type: parseType(typeof body.type === "string" ? body.type : body.type),
    city: body.city,
    country: body.country,
    address: body.address,
    images: body.images !== undefined || (uploadedImages && uploadedImages.length) ? mergeImageUrls(body.images, uploadedImages) : undefined,
    bedrooms: parseNumberField(body.bedrooms, "bedrooms"),
    bathrooms: parseNumberField(body.bathrooms, "bathrooms"),
    area: parseNumberField(body.area, "area"),
  };

  if (payload.price !== undefined && payload.price <= 0) {
    throw new ApiError(400, "price must be greater than 0");
  }

  return payload;
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

    const payload = validateCreatePayload(req.body, req.uploadedImageUrls);
    const property = await createProperty(payload, req.user.id);
    res.status(201).json(createResponse("Property created successfully", property));
  },

  update: async (req: Request<{ id: string }, unknown, PropertyBody>, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const property = await updateProperty(req.params.id, normalizeUpdatePayload(req.body, req.uploadedImageUrls), {
      id: req.user.id,
      role: req.user.role,
    });

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
