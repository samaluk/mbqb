import { createElement } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FieldError } from '@/components/ui/field'

describe('FieldError', () => {
  it('renders provided children instead of projecting errors', () => {
    const { container } = render(
      createElement(FieldError, null, createElement('span', null, 'custom content')),
    )

    const alert = container.querySelector('[data-slot="field-error"]')
    expect(alert?.textContent).toBe('custom content')
  })

  it('renders nothing without errors', () => {
    const { container } = render(createElement(FieldError, null))

    expect(container.querySelector('[data-slot="field-error"]')).toBeNull()
  })

  it('renders an empty error list as nothing', () => {
    const { container } = render(createElement(FieldError, { errors: [] }))

    expect(container.querySelector('[data-slot="field-error"]')).toBeNull()
  })

  it('renders a single error message inline', () => {
    const { container } = render(createElement(FieldError, { errors: [{ message: 'Requerido' }] }))

    const alert = container.querySelector('[role="alert"]')
    expect(alert?.textContent).toBe('Requerido')
    expect(alert?.querySelector('ul')).toBeNull()
  })

  it('renders multiple unique error messages as a deduplicated list', () => {
    const { container } = render(
      createElement(FieldError, {
        errors: [{ message: 'Requerido' }, { message: 'Muy corto' }, { message: 'Requerido' }],
      }),
    )

    const items = container.querySelectorAll('li')
    expect(items).toHaveLength(2)
    expect(items[0]?.textContent).toBe('Requerido')
    expect(items[1]?.textContent).toBe('Muy corto')
  })

  it('skips errors without messages when rendering the list', () => {
    const { container } = render(
      createElement(FieldError, { errors: [{ message: 'Requerido' }, {}] }),
    )

    const items = container.querySelectorAll('li')
    expect(items).toHaveLength(1)
    expect(items[0]?.textContent).toBe('Requerido')
  })
})
