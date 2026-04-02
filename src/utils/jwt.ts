import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string;
  role: "USER" | "ADMIN" | "AGENT";
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.accessTokenExpiresIn as SignOptions["expiresIn"],
  });
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  const expiresInSeconds = env.refreshTokenExpiresInDays * 24 * 60 * 60;
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: expiresInSeconds,
  });
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const decoded = jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;

  if (!decoded.sub || !decoded.tokenId) {
    throw new Error("Invalid refresh token payload");
  }

  return {
    sub: decoded.sub,
    tokenId: decoded.tokenId as string,
  };
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, env.jwtAccessSecret) as JwtPayload;

  if (!decoded.sub || !decoded.role) {
    throw new Error("Invalid access token payload");
  }

  return {
    sub: decoded.sub,
    role: decoded.role as AccessTokenPayload["role"],
  };
};
