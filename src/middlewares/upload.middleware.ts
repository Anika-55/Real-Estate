import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { env } from "../config/env";
import { cloudinary } from "../config/cloudinary";
import { ApiError } from "../utils/api-error";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new ApiError(400, "Only image files are allowed"));
      return;
    }

    cb(null, true);
  },
});

const uploadToCloudinary = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinaryFolder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
};

export const uploadPropertyImages = (req: Request, _res: Response, next: NextFunction): void => {
  upload.array("images", 10)(req, _res, async (error: unknown) => {
    if (error) {
      next(error);
      return;
    }

    try {
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];

      if (!files.length) {
        next();
        return;
      }

      const urls = await Promise.all(files.map((file) => uploadToCloudinary(file.buffer)));
      req.uploadedImageUrls = urls;
      next();
    } catch {
      next(new ApiError(500, "Failed to upload images"));
    }
  });
};
