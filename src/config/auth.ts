import { CookieOptions } from "express";
import { env } from "./env";

export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

const isProduction = env.nodeEnv === "production";

const baseRefreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  path: "/api/v1/auth",
  domain: env.cookieDomain || undefined,
};

export const createRefreshTokenCookieOptions = (): CookieOptions => ({
  ...baseRefreshTokenCookieOptions,
  maxAge: env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
});

export const clearRefreshTokenCookieOptions: CookieOptions = {
  ...baseRefreshTokenCookieOptions,
  maxAge: 0,
};
