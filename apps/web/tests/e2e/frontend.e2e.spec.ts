import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can go on homepage', async () => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Community/)

    const heading = page.locator('h1').first()

    await expect(heading).toHaveText('Community')
  })

  test('can check invalid Bogeyficador input', async () => {
    await page.goto('/bogeyficador')

    await page.getByLabel('RUT').fill('123456789')
    await page.getByRole('button', { name: 'Revisar membresia' }).click()

    await expect(page.getByText('Revisa el RUT ingresado.')).toBeVisible()
  })

  test('public launch routes render', async () => {
    for (const path of ['/canchas', '/la-biblia', '/products', '/privacy']) {
      const response = await page.goto(path)

      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toBeVisible()
    }
  })
})
