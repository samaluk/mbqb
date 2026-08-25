import { fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

describe('ToggleGroup', () => {
  it('renders items inside the labelled group and marks the pressed item', () => {
    render(
      createElement(
        ToggleGroup,
        { 'aria-label': 'demo', variant: 'outline' },
        createElement(ToggleGroupItem, { value: 'cards' }, 'Mapa'),
        createElement(ToggleGroupItem, { value: 'table' }, 'Tabla'),
      ),
    )

    const group = screen.getByRole('group', { name: 'demo' })

    expect(group).toBeTruthy()

    const table = screen.getByText('Tabla')

    fireEvent.click(table)
    expect(table.getAttribute('aria-pressed')).toBe('true')
  })

  it('renders a standalone item with default context values', () => {
    render(createElement(ToggleGroupItem, { value: 'solo' }, 'Solo'))

    const solo = screen.getByText('Solo')

    expect(solo).toBeTruthy()
    expect(solo.getAttribute('data-variant')).toBe('default')
  })
})
