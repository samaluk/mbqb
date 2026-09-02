import { expect, it, vi } from 'vitest'

import { DEFAULT_SITE_SETTINGS, getSiteSettings } from '@/lib/siteSettings'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))
vi.mock('next/headers', () => ({
  draftMode: vi.fn(),
}))
vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
}))

it('provides generic community fallback defaults when CMS data is empty or unavailable', () => {
  expect(DEFAULT_SITE_SETTINGS.brandName).toBe('Community')
  expect(DEFAULT_SITE_SETTINGS.defaultLocale).toBe('en')
  expect(DEFAULT_SITE_SETTINGS.lang).toBe('en')
  expect(DEFAULT_SITE_SETTINGS.siteDescription).toBe(
    'A platform for community connection and shared knowledge.',
  )
})

it('fetches published site settings when draft mode is disabled', async () => {
  const { draftMode } = await import('next/headers')
  const { getPayload } = await import('payload')

  vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as any)
  const mockFindGlobal = vi.fn().mockResolvedValue({
    id: 1,
    brandName: 'Custom Brand',
    siteDescription: 'Custom Description',
    defaultLocale: 'es',
    lang: 'es-CL',
  })
  vi.mocked(getPayload).mockResolvedValue({
    findGlobal: mockFindGlobal,
  } as any)

  const settings = await getSiteSettings()

  expect(settings.brandName).toBe('Custom Brand')
  expect(settings.siteDescription).toBe('Custom Description')
  expect(settings.lang).toBe('es-CL')
  expect(mockFindGlobal).toHaveBeenCalledWith(
    expect.objectContaining({ slug: 'site-settings', draft: false }),
  )
})

it('returns fallback defaults if getPayload throws an unavailable error', async () => {
  const { draftMode } = await import('next/headers')
  const { getPayload } = await import('payload')

  vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as any)
  vi.mocked(getPayload).mockRejectedValue({ code: '42P01' })

  const settings = await getSiteSettings()

  expect(settings).toEqual(DEFAULT_SITE_SETTINGS)
})
