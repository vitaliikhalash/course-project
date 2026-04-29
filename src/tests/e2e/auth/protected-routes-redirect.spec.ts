import { expect, test } from "@playwright/test";
import { mockGuestSession } from "@/tests/e2e/helpers/network";
test.describe("Protected routes redirects", () => {
  test("guest is redirected from wallet to login modal", async ({ page }) => {
    await mockGuestSession(page);
    await page.goto("/wallet");
    await expect(page).toHaveURL(/\/\?modal=login/);
  });
  test("guest is redirected from admin to unauthorized", async ({ page }) => {
    await mockGuestSession(page);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/unauthorized/);
  });
  test("guest is redirected from add-card to login modal", async ({ page }) => {
    await mockGuestSession(page);
    await page.goto("/wallet/add-card");
    await expect(page).toHaveURL(/\/(\?modal=login)?$/);
    await expect(
      page.getByRole("dialog", {
        name: "Увійдіть до свого облікового запису",
      }),
    ).toBeVisible();
  });
});
