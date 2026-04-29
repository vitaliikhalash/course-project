import { expect, test } from "@playwright/test";
test.describe("Transfers (authenticated user)", () => {
  test("user can complete transfer to external destination", async ({
    page,
  }) => {
    await page.goto("/transfers");
    await expect(page).toHaveURL(/\/transfers/);
    await expect(
      page.getByRole("heading", {
        name: "Переказ коштів",
      }),
    ).toBeVisible();
    await expect(page.getByText("Немає карток для переказу")).not.toBeVisible();
    const externalInput = page.getByLabel("Номер картки або IBAN");
    await expect(externalInput).toBeVisible();
    await externalInput.fill("5105105105105100");
    await page.getByLabel("Сума переказу в гривнях").fill("10");
    await page
      .getByRole("button", {
        name: "Переказати кошти",
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Підтвердіть переказ",
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Підтвердити",
      })
      .click();
    await expect(
      page.getByText(/Переказ 10\.00 UAH виконано успішно!/),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Історія транзакцій",
      }),
    ).toBeVisible();
  });
});
