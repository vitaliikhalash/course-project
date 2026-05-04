/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const { neonConfig } = require("@neondatabase/serverless");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { PrismaPg } = require("@prisma/adapter-pg");
const ws = require("ws");
const { PrismaClient } = require("../src/generated/prisma");

const PRODUCTS = [
  { type: "DIGITAL", name: "Digital картка" },
  { type: "UNIVERSAL", name: "Картка Універсальна" },
];

const PAYMENT_SYSTEMS = ["VISA", "MASTERCARD"];

const TIERS = ["STANDARD", "GOLD"];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set (export it or define it in .env at project root)",
    );
  }

  const connectionString = process.env.DATABASE_URL;
  const adapter =
    process.env.PRISMA_DATABASE_ADAPTER === "pg"
      ? new PrismaPg(connectionString)
      : (() => {
          neonConfig.webSocketConstructor = ws;
          return new PrismaNeon({ connectionString });
        })();
  const prisma = new PrismaClient({ adapter });
  try {
    await prisma.currency.upsert({
      where: { code: "UAH" },
      update: {},
      create: {
        code: "UAH",
        symbol: "₴",
        decimals: 2,
      },
    });

    for (const { type, name } of PRODUCTS) {
      for (const tier of TIERS) {
        for (const paymentSystem of PAYMENT_SYSTEMS) {
          await prisma.cardProduct.upsert({
            where: {
              type_tier_paymentSystem: {
                type,
                tier,
                paymentSystem,
              },
            },
            update: { name },
            create: {
              name,
              type,
              tier,
              paymentSystem,
            },
          });
        }
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
