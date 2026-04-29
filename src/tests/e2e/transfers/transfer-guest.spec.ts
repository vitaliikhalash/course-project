import { expect, test } from "@playwright/test";
test.describe("Transfers for guest users", () => {
  test("redirects guest to login modal when opening transfers", async ({ page }) => {
    await page.goto("/transfers");
    await expect(page).toHaveURL(/\/(\?modal=login)?$/);
    await expect(
      page.getByRole("dialog", {
        name: "Увійдіть до свого облікового запису",
      }),
    ).toBeVisible();
  });
});
