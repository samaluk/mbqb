import { describe, expect, it } from 'vitest'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { renderLexicalBodyToHTML } from '@/lib/lexicalBody'

describe('renderLexicalBodyToHTML', () => {
  it('renders Lexical-only content without fallback HTML', () => {
    expect(
      renderLexicalBodyToHTML({
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Hola',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: null,
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState),
    ).toContain('Hola')
  })
})
