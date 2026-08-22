// React's `CSSProperties` is closed over standard CSS property names, so
// inline style objects using CSS custom properties (e.g. `--normal-bg`) would
// otherwise need type assertions. Augmenting the interface lets style objects
// be annotated (or passed directly) instead of asserted.
import type * as React from 'react'

declare module 'react' {
  export interface CSSProperties {
    [customProperty: `--${string}`]: string | number | undefined
  }
}
