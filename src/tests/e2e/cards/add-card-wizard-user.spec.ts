import { expect, test } from "@playwright/test";

test.describe("Add card wizard (authenticated user)", () => {
  test("user can open wizard and submit card request", async ({ page }) => {
    await page.goto("/wallet/add-card");
    await expect(page).toHaveURL(/\/wallet\/add-card/);
    await expect(
      page.getByRole("heading", {
        name: "Оберіть продукт",
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Digital картка",
      })
      .click();
    await expect(page.getByText("Платіжна система")).toBeVisible();
    await page
      .getByRole("button", {
        name: "Далі",
      })
      .click();
    await expect(page.getByText("Заявку на картку успішно подано!")).toBeVisible();
    await expect(page).toHaveURL(/\/wallet$/);
    await expect(
      page.getByRole("heading", {
        name: "Картки",
      }),
    ).toBeVisible();
  });
});
