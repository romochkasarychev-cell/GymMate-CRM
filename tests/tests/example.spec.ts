import { test, expect } from '@playwright/test';
import { testUser } from '../tests/testData';


test('Переход на страницу и логин под Админским юзером', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('textbox',{name:'Email'}).fill(testUser.email);
  await page.getByRole('textbox',{name:'Пароль'}).fill(testUser.password);
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
});
