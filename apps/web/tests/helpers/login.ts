import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  serverURL?: string
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login({ page, serverURL, user }: LoginOptions): Promise<void> {
  const loginPath = serverURL ? `${serverURL}/admin/login` : '/admin/login'
  const adminPath = serverURL ? `${serverURL}/admin` : '/admin'

  await page.goto(loginPath)

  await page.fill('#field-email', user.email)
  await page.fill('#field-password', user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(serverURL ? adminPath : /\/admin(?:\/|$)/)

  const dashboardArtifact = page.locator('span[title="Dashboard"]')
  await expect(dashboardArtifact).toBeVisible()
}
