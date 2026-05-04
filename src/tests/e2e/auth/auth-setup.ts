import { expect, type Page, test } from "@playwright/test";
import bcrypt from "bcryptjs";
import { Prisma } from "../../../generated/prisma";
import { prisma } from "../../../lib/prisma";
const USER = {
  email: "e2e_user@example.com",
  password: "e2e-user-password-123",
  firstName: "E2E",
  lastName: "User",
  phoneNumber: "+380996389722",
};
const ADMIN = {
  email: "e2e_admin@example.com",
  password: "e2e-admin-password-123",
  firstName: "E2E",
  lastName: "Admin",
  phoneNumber: "+380996389733",
};
const OWNER = {
  email: "e2e_owner@example.com",
  password: "e2e-owner-password-123",
  firstName: "E2E",
  lastName: "Owner",
  phoneNumber: "+380996389744",
};
const RECIPIENT = {
  email: "e2e_recipient@example.com",
  password: "e2e-recipient-password-123",
  firstName: "E2E",
  lastName: "Recipient",
  phoneNumber: "+380996389755",
};
const E2E_ACTIVE_CARD_ID = "cmofrjyxo0003jyp8scd7iy7a";
const E2E_PENDING_CARD_ID = "cmofrjyxo0003jyp8scd7iy7b";
const E2E_FROZEN_REQUESTED_CARD_ID = "cmofrjyxo0003jyp8scd7iy7c";
const E2E_RECIPIENT_CARD_ID = "cmofrjyxo0003jyp8scd7iy7d";

async function ensureCatalogAndUserCard(userId: string) {
  await prisma.card.deleteMany({
    where: {
      id: {
        in: [
          "e2e_user_active_card",
          "e2e_user_pending_card",
          "e2e_user_frozen_requested_card",
          "e2e_recipient_card",
        ],
      },
    },
  });
  await prisma.currency.upsert({
    where: {
      code: "UAH",
    },
    update: {},
    create: {
      code: "UAH",
      symbol: "₴",
      decimals: 2,
    },
  });
  const universalVisaStandard = await prisma.cardProduct.upsert({
    where: {
      type_tier_paymentSystem: {
        type: "UNIVERSAL",
        tier: "STANDARD",
        paymentSystem: "VISA",
      },
    },
    update: {
      name: "Картка Універсальна",
    },
    create: {
      name: "Картка Універсальна",
      type: "UNIVERSAL",
      tier: "STANDARD",
      paymentSystem: "VISA",
    },
  });
  const digitalMastercardStandard = await prisma.cardProduct.upsert({
    where: {
      type_tier_paymentSystem: {
        type: "DIGITAL",
        tier: "STANDARD",
        paymentSystem: "MASTERCARD",
      },
    },
    update: {
      name: "Digital картка",
    },
    create: {
      name: "Digital картка",
      type: "DIGITAL",
      tier: "STANDARD",
      paymentSystem: "MASTERCARD",
    },
  });
  await prisma.card.upsert({
    where: {
      id: E2E_ACTIVE_CARD_ID,
    },
    update: {
      userId,
      name: "E2E Active Card",
      productId: universalVisaStandard.id,
      cardNumber: "4242424242424242",
      iban: "UA111111111111111111111111111",
      balance: new Prisma.Decimal(100000),
      currencyCode: "UAH",
      status: "ACTIVE",
      unfreezeRequestedAt: null,
    },
    create: {
      id: E2E_ACTIVE_CARD_ID,
      userId,
      name: "E2E Active Card",
      productId: universalVisaStandard.id,
      cardNumber: "4242424242424242",
      iban: "UA111111111111111111111111111",
      balance: new Prisma.Decimal(100000),
      currencyCode: "UAH",
      status: "ACTIVE",
    },
  });
  await prisma.card.upsert({
    where: {
      id: E2E_PENDING_CARD_ID,
    },
    update: {
      userId,
      name: "E2E Pending Card",
      productId: digitalMastercardStandard.id,
      currencyCode: "UAH",
      status: "PENDING",
      cardNumber: null,
      iban: null,
      unfreezeRequestedAt: null,
    },
    create: {
      id: E2E_PENDING_CARD_ID,
      userId,
      name: "E2E Pending Card",
      productId: digitalMastercardStandard.id,
      currencyCode: "UAH",
      status: "PENDING",
    },
  });
  await prisma.card.upsert({
    where: {
      id: E2E_FROZEN_REQUESTED_CARD_ID,
    },
    update: {
      userId,
      name: "E2E Frozen Requested Card",
      productId: universalVisaStandard.id,
      currencyCode: "UAH",
      status: "FROZEN",
      cardNumber: "4000000000000101",
      iban: "UA222222222222222222222222222",
      unfreezeRequestedAt: new Date(),
    },
    create: {
      id: E2E_FROZEN_REQUESTED_CARD_ID,
      userId,
      name: "E2E Frozen Requested Card",
      productId: universalVisaStandard.id,
      currencyCode: "UAH",
      status: "FROZEN",
      cardNumber: "4000000000000101",
      iban: "UA222222222222222222222222222",
      unfreezeRequestedAt: new Date(),
    },
  });
}
async function seedE2EUsers() {
  const [userPasswordHash, adminPasswordHash, ownerPasswordHash, recipientPasswordHash] =
    await Promise.all([
      bcrypt.hash(USER.password, 10),
      bcrypt.hash(ADMIN.password, 10),
      bcrypt.hash(OWNER.password, 10),
      bcrypt.hash(RECIPIENT.password, 10),
    ]);
  const user = await prisma.user.upsert({
    where: {
      email: USER.email,
    },
    update: {
      password: userPasswordHash,
      role: "USER",
    },
    create: {
      email: USER.email,
      password: userPasswordHash,
      role: "USER",
    },
  });
  await prisma.userProfile.upsert({
    where: {
      userId: user.id,
    },
    update: {
      firstName: USER.firstName,
      lastName: USER.lastName,
      phoneNumber: USER.phoneNumber,
    },
    create: {
      userId: user.id,
      firstName: USER.firstName,
      lastName: USER.lastName,
      phoneNumber: USER.phoneNumber,
    },
  });
  await ensureCatalogAndUserCard(user.id);
  const admin = await prisma.user.upsert({
    where: {
      email: ADMIN.email,
    },
    update: {
      password: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      email: ADMIN.email,
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });
  await prisma.userProfile.upsert({
    where: {
      userId: admin.id,
    },
    update: {
      firstName: ADMIN.firstName,
      lastName: ADMIN.lastName,
      phoneNumber: ADMIN.phoneNumber,
    },
    create: {
      userId: admin.id,
      firstName: ADMIN.firstName,
      lastName: ADMIN.lastName,
      phoneNumber: ADMIN.phoneNumber,
    },
  });
  const owner = await prisma.user.upsert({
    where: {
      email: OWNER.email,
    },
    update: {
      password: ownerPasswordHash,
      role: "OWNER",
    },
    create: {
      email: OWNER.email,
      password: ownerPasswordHash,
      role: "OWNER",
    },
  });
  await prisma.userProfile.upsert({
    where: {
      userId: owner.id,
    },
    update: {
      firstName: OWNER.firstName,
      lastName: OWNER.lastName,
      phoneNumber: OWNER.phoneNumber,
    },
    create: {
      userId: owner.id,
      firstName: OWNER.firstName,
      lastName: OWNER.lastName,
      phoneNumber: OWNER.phoneNumber,
    },
  });
  const recipient = await prisma.user.upsert({
    where: {
      email: RECIPIENT.email,
    },
    update: {
      password: recipientPasswordHash,
      role: "USER",
    },
    create: {
      email: RECIPIENT.email,
      password: recipientPasswordHash,
      role: "USER",
    },
  });
  await prisma.userProfile.upsert({
    where: {
      userId: recipient.id,
    },
    update: {
      firstName: RECIPIENT.firstName,
      lastName: RECIPIENT.lastName,
      phoneNumber: RECIPIENT.phoneNumber,
    },
    create: {
      userId: recipient.id,
      firstName: RECIPIENT.firstName,
      lastName: RECIPIENT.lastName,
      phoneNumber: RECIPIENT.phoneNumber,
    },
  });
  const recipientProduct = await prisma.cardProduct.upsert({
    where: {
      type_tier_paymentSystem: {
        type: "UNIVERSAL",
        tier: "STANDARD",
        paymentSystem: "MASTERCARD",
      },
    },
    update: {
      name: "E2E Recipient Product",
    },
    create: {
      name: "E2E Recipient Product",
      type: "UNIVERSAL",
      tier: "STANDARD",
      paymentSystem: "MASTERCARD",
    },
  });
  await prisma.card.upsert({
    where: {
      id: E2E_RECIPIENT_CARD_ID,
    },
    update: {
      userId: recipient.id,
      name: "E2E Recipient Card",
      productId: recipientProduct.id,
      cardNumber: "5105105105105100",
      iban: "UA333333333333333333333333333",
      balance: new Prisma.Decimal(25000),
      currencyCode: "UAH",
      status: "ACTIVE",
      unfreezeRequestedAt: null,
    },
    create: {
      id: E2E_RECIPIENT_CARD_ID,
      userId: recipient.id,
      name: "E2E Recipient Card",
      productId: recipientProduct.id,
      cardNumber: "5105105105105100",
      iban: "UA333333333333333333333333333",
      balance: new Prisma.Decimal(25000),
      currencyCode: "UAH",
      status: "ACTIVE",
    },
  });
}
async function loginAndPersistState(
  page: Page,
  email: string,
  password: string,
  outputPath: string,
) {
  await page.goto("/?modal=login");
  await page.getByLabel("Електронна адреса").fill(email);
  await page.getByLabel("Пароль").fill(password);
  await page
    .getByRole("button", {
      name: "Увійти",
    })
    .click();
  await expect(page).not.toHaveURL(/\/api\/auth\/error/);
  await expect(
    page.getByRole("button", {
      name: "Відкрити профіль",
    }),
  ).toBeVisible();
  await page.goto("/wallet");
  await expect(page).toHaveURL(/\/wallet/);
  await page.context().storageState({
    path: outputPath,
  });
}
test("create authenticated storage states for user, admin, and owner projects", async ({
  page,
  browser,
}) => {
  try {
    await seedE2EUsers();
    await loginAndPersistState(
      page,
      USER.email,
      USER.password,
      "src/tests/e2e/.auth/user.json",
    );
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAndPersistState(
      adminPage,
      ADMIN.email,
      ADMIN.password,
      "src/tests/e2e/.auth/admin.json",
    );
    await adminContext.close();
    const ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    await loginAndPersistState(
      ownerPage,
      OWNER.email,
      OWNER.password,
      "src/tests/e2e/.auth/owner.json",
    );
    await ownerContext.close();
  } finally {
    await prisma.$disconnect();
  }
});
