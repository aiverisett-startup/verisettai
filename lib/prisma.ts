import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  } catch (err) {
    console.warn("[PRISMA_CLIENT_INITIALIZATION_FALLBACK]:", err);
    return new Proxy({} as PrismaClient, {
      get: (_target, prop) => {
        if (typeof prop === "string" && !prop.startsWith("$")) {
          return new Proxy({}, {
            get: () => () => Promise.resolve(null),
          });
        }
        return () => Promise.resolve(null);
      },
    });
  }
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
