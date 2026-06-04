import { describe, expect, it } from 'vitest'

import { sanitizeHtml } from '@/lib/sanitizeHtml'

describe('sanitizeHtml', () => {
  it('preserves allowed editorial markup', () => {
    expect(
      sanitizeHtml(
        '<h2>Titulo</h2><p class="lede">Texto <strong>importante</strong> <a href="https://example.com" target="_blank">link</a>.</p>',
      ),
    ).toBe(
      '<h2>Titulo</h2><p class="lede">Texto <strong>importante</strong> <a href="https://example.com" target="_blank">link</a>.</p>',
    )
  })

  it('removes unsafe blocks and unsupported tags', () => {
    expect(
      sanitizeHtml('<p>Antes</p><script>alert(1)</script><iframe src="https://example.com"></iframe><p>Despues</p>'),
    ).toBe('<p>Antes</p><p>Despues</p>')
  })

  it('strips event handlers and unsafe urls', () => {
    expect(
      sanitizeHtml(
        '<p onclick="alert(1)">Texto</p><a href="javascript:alert(1)" onmouseover="alert(2)">link</a><img src="data:text/html;base64,abc" onerror="alert(3)" />',
      ),
    ).toBe('<p>Texto</p><a>link</a><img />')
  })

  it('escapes allowed attribute values', () => {
    expect(sanitizeHtml('<img src="/logo.png" alt="MBQB &quot;Logo&quot;" title="MBQB & golf" />')).toBe(
      '<img src="/logo.png" alt="MBQB &amp;quot;Logo&amp;quot;" title="MBQB &amp; golf" />',
    )
  })
})
