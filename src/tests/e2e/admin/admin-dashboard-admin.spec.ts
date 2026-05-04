import { expect, test } from "@playwright/test";
test.describe("Admin dashboard (admin role)", () => {
  test("admin can activate seeded pending card request", async ({
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
        name: "Картки користувачів",
      }),
    ).toBeVisible();
    const seededRow = page
      .getByRole("row", {
        name: /E2E Pending Card/i,
      })
      .filter({
        has: page.getByRole("button", { name: "Активувати" }),
      });
    await expect(seededRow).toHaveCount(1);
    await seededRow
      .getByRole("button", {
        name: "Активувати",
      })
      .click();
    await expect(seededRow).toHaveCount(0, {
      timeout: 15000,
    });
  });
});
