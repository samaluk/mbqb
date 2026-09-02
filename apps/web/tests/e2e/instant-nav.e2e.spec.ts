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
} as const

const listToDetailFlows = [
  {
    name: 'canchas',
    listPath: '/canchas',
    fixtureCard: 'Cancha Fixture Uno',
    triggerLink: 'Ver ficha',
    shell: SHELL.canchaDetail,
    deferredTitle: 'cancha-detail-title',
    urlPattern: /\/canchas\/cancha-fixture-1/,
  },
  {
    name: 'la biblia',
    listPath: '/la-biblia',
    fixtureCard: 'Articulo Fixture Uno',
    triggerLink: 'Leer articulo',
    shell: SHELL.articleDetail,
    deferredTitle: 'article-detail-title',
    urlPattern: /\/la-biblia\/articulo-fixture-1/,
  },
  {
    name: 'productos',
    listPath: '/productos',
    fixtureCard: 'Producto Fixture Uno',
    triggerLink: 'Ver producto',
    shell: SHELL.productDetail,
    deferredTitle: 'product-detail-title',
    urlPattern: /\/productos\/producto-fixture-1/,
  },
] as const

for (const flow of listToDetailFlows) {
  test(`${flow.name} list → detail commits its shell instantly`, async ({ page }) => {
    await page.goto(flow.listPath)

    const fixtureCard = page.locator('[data-slot="card"]').filter({ hasText: flow.fixtureCard })
    const trigger = fixtureCard.getByRole('link', { name: flow.triggerLink })
    await expect(trigger).toBeVisible({ timeout: 20_000 })

    await instant(page, async () => {
      await trigger.click()
      await expect(page.locator(flow.shell)).toBeVisible()
      await expect(page.getByTestId(flow.deferredTitle)).toHaveCount(0)
    })

    await expect(page.getByTestId(flow.deferredTitle)).toBeVisible()
    await expect(page).toHaveURL(flow.urlPattern)
  })
}

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
  // Smoke guard: /bogeyficador is fully static (no dynamic reads, no
  // Suspense), so this lock asserts the prerendered page commits rather than
  // exercising the shell mechanism. It regression-guards the AC but can
  // never fail on this code path on its own.
  await page.goto('/')

  const trigger = page.getByTestId('home-bogeyficador-cta')
  await expect(trigger).toBeVisible({ timeout: 20_000 })

  await instant(page, async () => {
    await trigger.click()
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /membresia/i,
      }),
    ).toBeVisible()
  })
})
