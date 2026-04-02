import { Request, Response } from "express";
import { createUser, getUsers } from "../services/user.service";
import { ApiError } from "../utils/api-error";
import { createResponse } from "../utils/api-response";

interface CreateUserBody {
  email?: string;
  name?: string;
  password?: string;
  role?: "USER" | "ADMIN" | "AGENT";
  phone?: string;
}

export const userController = {
  list: async (_req: Request, res: Response): Promise<void> => {
    const users = await getUsers();
    res.status(200).json(createResponse("Users fetched successfully", users));
  },

  create: async (req: Request<unknown, unknown, CreateUserBody>, res: Response): Promise<void> => {
    const { email, name, password, role, phone } = req.body;

    if (!email || !name || !password) {
      throw new ApiError(400, "email, name and password are required");
    }

    const user = await createUser({ email, name, password, role, phone });
    res.status(201).json(createResponse("User created successfully", user));
  },
};
