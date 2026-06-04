import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

import { sanitizeHtml } from './sanitizeHtml'

type LexicalBody = SerializedEditorState | null | undefined

export function renderLexicalBodyToHTML(body: LexicalBody, fallbackHtml: string): string {
  if (!body) {
    return sanitizeHtml(fallbackHtml)
  }

  return convertLexicalToHTML({ data: body })
}
