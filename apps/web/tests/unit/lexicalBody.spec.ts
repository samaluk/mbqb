import { describe, expect, it } from 'vitest'
import type {
  SerializedEditorState,
  SerializedParagraphNode,
  SerializedRootNode,
  SerializedTextNode,
} from '@payloadcms/richtext-lexical/lexical'

import { renderLexicalBodyToHTML } from '@/lib/lexicalBody'

const textNode: SerializedTextNode = {
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: 'Hola',
  type: 'text',
  version: 1,
}

const paragraphNode: SerializedParagraphNode = {
  children: [textNode],
  direction: null,
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  type: 'paragraph',
  version: 1,
}

const rootNode: SerializedRootNode = {
  children: [paragraphNode],
  direction: null,
  format: '',
  indent: 0,
  type: 'root',
  version: 1,
}

const lexicalDoc: SerializedEditorState = { root: rootNode }

describe('renderLexicalBodyToHTML', () => {
  it('renders Lexical-only content without fallback HTML', () => {
    expect(renderLexicalBodyToHTML(lexicalDoc)).toContain('Hola')
  })
})
