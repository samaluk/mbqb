import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

export type LexicalBody = SerializedEditorState | null | undefined

export function renderLexicalBodyToHTML(body: LexicalBody): string {
  if (!body) {
    return ''
  }

  return convertLexicalToHTML({ data: body })
}
