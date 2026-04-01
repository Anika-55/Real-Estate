import { Request, Response } from "express";
import { createUser, getUsers } from "../services/user.service";
import { ApiError } from "../utils/api-error";
import { createResponse } from "../utils/api-response";

interface CreateUserBody {
  email?: string;
  fullName?: string;
}

export const userController = {
  list: async (_req: Request, res: Response): Promise<void> => {
    const users = await getUsers();
    res.status(200).json(createResponse("Users fetched successfully", users));
  },

  create: async (req: Request<unknown, unknown, CreateUserBody>, res: Response): Promise<void> => {
    const { email, fullName } = req.body;

    if (!email || !fullName) {
      throw new ApiError(400, "email and fullName are required");
    }

    const user = await createUser({ email, fullName });
    res.status(201).json(createResponse("User created successfully", user));
  },
};

