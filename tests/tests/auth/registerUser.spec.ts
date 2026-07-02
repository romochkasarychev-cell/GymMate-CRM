import { test, expect } from '@playwright/test';
import { createRegisterUser } from '../testData/testData';

test('Регистрация нового пользователя', async ({ page }) => {
    const testUserRegister = createRegisterUser()
    await page.goto('http://localhost:3000');
    await page.getByRole('link', {name: 'Зарегистрироваться'}).click();
    await page.getByRole('textbox',{name:'Имя'}).fill(testUserRegister.name);
    await page.getByRole('textbox',{name:'Фамилия'}).fill(testUserRegister.surname);
    await page.getByRole('textbox',{name:'Email'}).fill(testUserRegister.email);
    await page.getByRole('textbox', {name: 'Пароль'}).fill(testUserRegister.password);
    await page.getByRole('button', {name: 'Создать аккаунт'}).click();
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
});