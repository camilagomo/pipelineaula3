import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/classe';

test.describe('Login', () => {
  test('login com sucesso', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('student', 'Password123');

    await expect(page).toHaveURL(/logged-in-successfully/);
  });

  test('login com credenciais invalidas', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('usuario_errado', 'senha_errada');

    const erro = await loginPage.getMensagemErro();
    expect(erro).toContain('Your username is invalid!');
  });
});