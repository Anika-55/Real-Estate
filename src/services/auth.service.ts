import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { generateSecureToken, hashValue } from "../utils/crypto";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthResponse {
  user: AuthUser;
  tokens: TokenPair;
}

const selectAuthUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
} as const;

const createTokenPair = async (userId: string, role: UserRole): Promise<TokenPair> => {
  const tokenId = generateSecureToken();
  const refreshToken = signRefreshToken({ sub: userId, tokenId });
  const refreshTokenHash = hashValue(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000),
    },
  });

  const accessToken = signAccessToken({ id: userId, role });

  return { accessToken, refreshToken };
};

export const register = async (payload: RegisterInput): Promise<AuthResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already in use");
  }

  const passwordHash = await bcrypt.hash(payload.password, env.bcryptSaltRounds);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: passwordHash,
      phone: payload.phone,
      role: UserRole.USER,
    },
    select: selectAuthUser,
  });

  const tokens = await createTokenPair(user.id, user.role);

  return { user, tokens };
};

export const login = async (payload: LoginInput): Promise<AuthResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = await createTokenPair(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    tokens,
  };
};

export const refreshAuth = async (refreshToken: string): Promise<AuthResponse> => {
  let payload: { sub: string; tokenId: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
  const refreshTokenHash = hashValue(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: refreshTokenHash },
  });

  if (!storedToken || storedToken.userId !== payload.sub || storedToken.revokedAt !== null || storedToken.expiresAt < new Date()) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: selectAuthUser,
  });

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await createTokenPair(user.id, user.role);

  return { user, tokens };
};

export const logout = async (refreshToken: string): Promise<void> => {
  try {
    verifyRefreshToken(refreshToken);
  } catch {
    return;
  }

  const refreshTokenHash = hashValue(refreshToken);

  const token = await prisma.refreshToken.findUnique({
    where: { tokenHash: refreshTokenHash },
  });

  if (!token || token.revokedAt) {
    return;
  }

  await prisma.refreshToken.update({
    where: { id: token.id },
    data: { revokedAt: new Date() },
  });
};

