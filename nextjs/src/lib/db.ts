import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [{ emit: "event", level: "query" }, "error", "warn"]
        : ["error", "warn"],
  });

prisma.$on("query", async (e) => {
  console.log(`${e.query} ${e.params}`);
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
