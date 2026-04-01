import { prisma } from "../config/prisma";

export interface HealthStatus {
  status: "ok" | "degraded";
  uptime: number;
  database: "up" | "down";
  timestamp: string;
}

export const getHealthStatus = async (): Promise<HealthStatus> => {
  let database: HealthStatus["database"] = "up";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "down";
  }

  return {
    status: database === "up" ? "ok" : "degraded",
    uptime: process.uptime(),
    database,
    timestamp: new Date().toISOString(),
  };
};

