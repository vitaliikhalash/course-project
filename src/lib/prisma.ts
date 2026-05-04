import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import ws from "ws";
import { PrismaClient } from "../generated/prisma";

function createPrismaAdapter() {
  const connectionString = process.env.DATABASE_URL!;
  if (process.env.PRISMA_DATABASE_ADAPTER === "pg") {
    return new PrismaPg(connectionString);
  }
  neonConfig.webSocketConstructor = ws;
  return new PrismaNeon({ connectionString });
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter: createPrismaAdapter(),
  });
};
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
