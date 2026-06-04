import { describe, expect, it } from 'vitest'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import {
  canConvertHTMLToLexicalBody,
  convertHTMLToLexicalBody,
} from '@/lib/convertHTMLToLexicalBody'
import { renderLexicalBodyToHTML } from '@/lib/lexicalBody'

describe('convertHTMLToLexicalBody', () => {
  it('converts basic rich HTML into Lexical', async () => {
    const body = await convertHTMLToLexicalBody(
      '<h2>Titulo</h2><p>Texto <strong>importante</strong> <a href="https://example.com">link</a>.</p><ul><li>Uno</li></ul>',
    )

    expect(body.root.children.length).toBeGreaterThan(0)
    expect(body.root.children.map((node) => node.type)).toEqual(['heading', 'paragraph', 'list'])
  })

  it('converts legacy images into upload nodes', async () => {
    const body = await convertHTMLToLexicalBody('<p>Antes</p><img src="https://mbqb.cl/foto.jpg" alt="Foto" />', {
      resolveImage: async () => ({ id: 123 }),
    })
    const uploadNode = body.root.children.find((node) => node.type === 'upload')

    expect(uploadNode).toMatchObject({
      fields: {},
      relationTo: 'media',
      type: 'upload',
      value: 123,
      version: 3,
    })
  })

  it('rejects unsafe legacy image URLs', () => {
    expect(canConvertHTMLToLexicalBody('<img src="data:text/html;base64,abc" />')).toBe(false)
  })

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
