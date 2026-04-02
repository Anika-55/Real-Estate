import { Request, Response } from "express";
import {
  clearRefreshTokenCookieOptions,
  createRefreshTokenCookieOptions,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../config/auth";
import { ApiError } from "../utils/api-error";
import { createResponse } from "../utils/api-response";
import { login, logout, refreshAuth, register } from "../services/auth.service";

interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

const setRefreshCookie = (res: Response, refreshToken: string): void => {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, createRefreshTokenCookieOptions());
};

const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, clearRefreshTokenCookieOptions);
};

export const authController = {
  register: async (req: Request<unknown, unknown, RegisterBody>, res: Response): Promise<void> => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, "name, email and password are required");
    }

    const result = await register({ name, email, password, phone });
    setRefreshCookie(res, result.tokens.refreshToken);

    res.status(201).json(
      createResponse("Registration successful", {
        user: result.user,
        accessToken: result.tokens.accessToken,
      })
    );
  },

  login: async (req: Request<unknown, unknown, LoginBody>, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "email and password are required");
    }

    const result = await login({ email, password });
    setRefreshCookie(res, result.tokens.refreshToken);

    res.status(200).json(
      createResponse("Login successful", {
        user: result.user,
        accessToken: result.tokens.accessToken,
      })
    );
  },

  refreshToken: async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

    if (!token) {
      throw new ApiError(401, "Refresh token is required");
    }

    const result = await refreshAuth(token);
    setRefreshCookie(res, result.tokens.refreshToken);

    res.status(200).json(
      createResponse("Token refreshed successfully", {
        user: result.user,
        accessToken: result.tokens.accessToken,
      })
    );
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

    if (token) {
      await logout(token);
    }

    clearRefreshCookie(res);
    res.status(200).json(createResponse("Logged out successfully"));
  },
};

