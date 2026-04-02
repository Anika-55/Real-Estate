import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

interface AccessTokenPayload {
  sub: string;
  role: "USER" | "ADMIN" | "AGENT";
}

interface RefreshTokenPayload {
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

