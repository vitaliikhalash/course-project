import { expect, test } from "@playwright/test";
test.describe("Auth modals", () => {
  test("user can switch between login and register modals", async ({
    page,
  }) => {
    await page.goto("/?modal=login");
    await expect(
      page.getByRole("heading", {
        name: "Увійдіть до свого облікового запису",
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Зареєструватися",
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Створення нового облікового запису",
      }),
    ).toBeVisible();
  });
  test("register form shows validation message for invalid payload", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", {
        name: "Реєстрація",
      })
      .click();
    const registerDialog = page.getByRole("dialog").filter({
      has: page.getByRole("heading", {
        name: "Створення нового облікового запису",
      }),
    });
    await expect(registerDialog).toBeVisible();
    await registerDialog.getByLabel("Ім'я користувача").fill("John");
    await registerDialog.getByLabel("Прізвище користувача").fill("Doe");
    await registerDialog.getByLabel("Номер телефону").fill("+0996389722");
    await registerDialog.getByLabel("Електронна адреса").fill("john@doe.com");
    await registerDialog.getByLabel("Пароль").fill("secret123");
    await registerDialog
      .getByRole("button", {
        name: "Зареєструватися",
      })
      .click();
    await expect(
      registerDialog.getByText("Некоректний номер телефону"),
    ).toBeVisible();
  });
});
