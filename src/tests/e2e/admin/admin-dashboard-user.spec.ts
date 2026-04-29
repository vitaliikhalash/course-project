import { expect, test } from "@playwright/test";
test.describe("Admin dashboard access (authenticated non-admin user)", () => {
  test("redirects authenticated user without ADMIN role to unauthorized page", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/unauthorized/);
    await expect(
      page.getByRole("heading", {
        name: "Доступ заборонено",
      }),
    ).toBeVisible();
  });
});
