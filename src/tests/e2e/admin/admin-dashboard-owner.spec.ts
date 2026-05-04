import { expect, test } from "@playwright/test";

test.describe("Admin dashboard (owner role)", () => {
  test("owner can access moderation and role management panel", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/);

    await expect(
      page.getByRole("heading", {
        name: "Заявки на активацію карток",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Запити на розмороження карток",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Ролі користувачів",
      }),
    ).toBeVisible();
  });

  test("owner cannot apply role change to self", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/);

    const selfRow = page.getByRole("row", {
      name: /e2e_owner@example\.com/i,
    });
    await expect(selfRow).toBeVisible();

    await expect(
      selfRow.getByRole("button", {
        name: "Застосувати",
      }),
    ).toBeDisabled();
  });
});
