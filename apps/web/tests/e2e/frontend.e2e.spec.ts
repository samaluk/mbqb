import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can go on homepage', async () => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/MBQB/)

    const heading = page.locator('h1').first()

    await expect(heading).toHaveText('Mas Bogeys Que Birdies')
  })

  test('can check invalid Bogeyficador input', async () => {
    await page.goto('http://localhost:3000/bogeyficador')

    await page.getByLabel('RUT').fill('123456789')
    await page.getByRole('button', { name: 'Revisar membresia' }).click()

    await expect(page.getByText('Revisa el RUT ingresado.')).toBeVisible()
  })
})
