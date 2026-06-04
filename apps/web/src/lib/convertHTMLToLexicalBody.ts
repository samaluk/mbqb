import config from '@payload-config'
import {
  convertHTMLToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { JSDOM } from 'jsdom'

import { sanitizeHtml } from './sanitizeHtml'

let editorConfigPromise: ReturnType<typeof editorConfigFactory.default> | undefined
const unsupportedLegacyHtmlPattern = /<img[\s>]/i

function getEditorConfig() {
  editorConfigPromise ??= config.then((resolvedConfig) =>
    editorConfigFactory.default({ config: resolvedConfig }),
  )
  return editorConfigPromise
}

export async function convertHTMLToLexicalBody(html: string): Promise<SerializedEditorState> {
  return convertHTMLToLexical({
    editorConfig: await getEditorConfig(),
    html: sanitizeHtml(html),
    JSDOM,
  })
}

export function canConvertHTMLToLexicalBody(html: string): boolean {
  return !unsupportedLegacyHtmlPattern.test(html)
}
