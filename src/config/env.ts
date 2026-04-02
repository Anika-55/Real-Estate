import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "test" | "production";

interface Env {
  nodeEnv: NodeEnv;
  port: number;
  databaseUrl: string;
  corsOrigin: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresInDays: number;
  bcryptSaltRounds: number;
  cookieDomain?: string;
}

const getNodeEnv = (): NodeEnv => {
  const env = process.env.NODE_ENV;

  if (env === "development" || env === "test" || env === "production") {
    return env;
  }

  return "development";
};

const parsePort = (value: string | undefined): number => {
  if (!value) return 5000;

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error("Invalid PORT value. It must be a positive number.");
  }

  return parsed;
};

const parsePositiveInt = (value: string | undefined, fallback: number, fieldName: string): number => {
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${fieldName} value. It must be a positive integer.`);
  }

  return parsed;
};

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const env: Env = {
  nodeEnv: getNodeEnv(),
  port: parsePort(process.env.PORT),
  databaseUrl: required("DATABASE_URL"),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  refreshTokenExpiresInDays: parsePositiveInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS, 7, "REFRESH_TOKEN_EXPIRES_DAYS"),
  bcryptSaltRounds: parsePositiveInt(process.env.BCRYPT_SALT_ROUNDS, 12, "BCRYPT_SALT_ROUNDS"),
  cookieDomain: process.env.COOKIE_DOMAIN,
};
