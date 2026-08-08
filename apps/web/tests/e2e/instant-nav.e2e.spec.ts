import { instant } from '@next/playwright'
import { expect, test } from '@playwright/test'

/**
 * Instant-navigation guards for the public content flows (issue #191).
 *
 * Each test locks dynamic data (instant()) while navigating and asserts the
 * destination's static shell commits under the lock. The self-validating
 * variant also asserts the deferred content is gated under the lock and
 * streams in after release, so a vacuous pass is impossible on a build that
 * lacks the testing API.
 *
 * Runs against the production build served by `next start` (see
 * instant-nav.rig.md). Test user: anonymous public visitor.
 */

const SHELL = {
  canchaDetail: '[data-testid="cancha-detail-back-link"]',
  articleDetail: '[data-testid="article-detail-back-link"]',
  productDetail: '[data-testid="product-detail-back-link"]',
  canchasList: '[data-testid="canchas-list-title"]',
}

test.describe('instant nav: public content flows', () => {
  test('canchas list → cancha detail commits its shell instantly', async ({ page }) => {
    await page.goto('/canchas')

    const fixtureCard = page.locator('[data-slot="card"]').filter({ hasText: 'Cancha Fixture Uno' })
    const trigger = fixtureCard.getByRole('link', { name: 'Ver ficha' })
    await expect(trigger).toBeVisible({ timeout: 20_000 })

    await instant(page, async () => {
      await trigger.click()
      await expect(page.getByTestId('cancha-detail-back-link')).toBeVisible()
      await expect(page.getByTestId('cancha-detail-title')).toHaveCount(0)
    })

    await expect(page.getByTestId('cancha-detail-title')).toBeVisible()
    await expect(page).toHaveURL(/\/canchas\/cancha-fixture-1/)
  })

  test('la biblia list → article commits its shell instantly', async ({ page }) => {
    await page.goto('/la-biblia')

    const fixtureCard = page
      .locator('[data-slot="card"]')
      .filter({ hasText: 'Articulo Fixture Uno' })
    const trigger = fixtureCard.getByRole('link', { name: 'Leer articulo' })
    await expect(trigger).toBeVisible({ timeout: 20_000 })

    await instant(page, async () => {
      await trigger.click()
      await expect(page.getByTestId('article-detail-back-link')).toBeVisible()
      await expect(page.getByTestId('article-detail-title')).toHaveCount(0)
    })

    await expect(page.getByTestId('article-detail-title')).toBeVisible()
    await expect(page).toHaveURL(/\/la-biblia\/articulo-fixture-1/)
  })

  test('productos list → product detail commits its shell instantly', async ({ page }) => {
    await page.goto('/productos')

    const fixtureCard = page
      .locator('[data-slot="card"]')
      .filter({ hasText: 'Producto Fixture Uno' })
    const trigger = fixtureCard.getByRole('link', { name: 'Ver producto' })
    await expect(trigger).toBeVisible({ timeout: 20_000 })

    await instant(page, async () => {
      await trigger.click()
      await expect(page.getByTestId('product-detail-back-link')).toBeVisible()
      await expect(page.getByTestId('product-detail-title')).toHaveCount(0)
    })

    await expect(page.getByTestId('product-detail-title')).toBeVisible()
    await expect(page).toHaveURL(/\/productos\/producto-fixture-1/)
  })

  test('home → Ver canchas CTA commits the canchas shell instantly', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByRole('link', { name: 'Ver canchas', exact: true })
    await expect(trigger).toBeVisible({ timeout: 20_000 })

    await instant(page, async () => {
      await trigger.click()
      await expect(page.locator(SHELL.canchasList)).toBeVisible()
      await expect(page.getByRole('link', { name: 'Ver ficha' })).toHaveCount(0)
    })

    await expect(page.getByRole('link', { name: 'Ver ficha' }).first()).toBeVisible()
    await expect(page).toHaveURL(/\/canchas$/)
  })

  test('home → Bogeyficador CTA commits instantly', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByTestId('home-bogeyficador-cta')
    await expect(trigger).toBeVisible({ timeout: 20_000 })

    await instant(page, async () => {
      await trigger.click()
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: 'Revisa tu membresia MBQB activa.',
        }),
      ).toBeVisible()
    })
  })
})
