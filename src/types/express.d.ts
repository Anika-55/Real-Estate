import type { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      email: string;
      role: UserRole;
      name: string;
      phone: string | null;
    }

    interface Request {
      requestId?: string;
      user?: AuthUser;
    }
  }
}

export {};
