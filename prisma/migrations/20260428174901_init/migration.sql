-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'FROZEN');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('DIGITAL', 'UNIVERSAL');

-- CreateEnum
CREATE TYPE "PaymentSystem" AS ENUM ('VISA', 'MASTERCARD');

-- CreateEnum
CREATE TYPE "CardTier" AS ENUM ('STANDARD', 'GOLD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "CardProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CardType" NOT NULL,
    "tier" "CardTier" NOT NULL,
    "paymentSystem" "PaymentSystem" NOT NULL,

    CONSTRAINT "CardProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "cardNumber" TEXT,
    "iban" TEXT,
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currencyCode" TEXT NOT NULL,
    "status" "CardStatus" NOT NULL DEFAULT 'PENDING',
    "unfreezeRequestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromCardId" TEXT NOT NULL,
    "toCardId" TEXT,
    "toExternal" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Перекази',
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemAuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_phoneNumber_key" ON "UserProfile"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CardProduct_type_tier_paymentSystem_key" ON "CardProduct"("type", "tier", "paymentSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Card_cardNumber_key" ON "Card"("cardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Card_iban_key" ON "Card"("iban");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CardProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fromCardId_fkey" FOREIGN KEY ("fromCardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_toCardId_fkey" FOREIGN KEY ("toCardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemAuditLog" ADD CONSTRAINT "SystemAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
