import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "../generated/prisma";
neonConfig.webSocketConstructor = ws;
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({
    connectionString,
  });
  return new PrismaClient({
    adapter,
  });
};
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
