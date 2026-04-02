import { createHash, randomBytes } from "crypto";

export const hashValue = (value: string): string => {
  return createHash("sha256").update(value).digest("hex");
};

export const generateSecureToken = (): string => {
  return randomBytes(48).toString("hex");
};

