import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "test" | "production";

interface Env {
  nodeEnv: NodeEnv;
  port: number;
  databaseUrl: string;
  corsOrigin: string;
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
};

