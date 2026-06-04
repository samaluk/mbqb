import config from '@payload-config'
import {
  convertHTMLToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { JSDOM } from 'jsdom'

import { sanitizeHtml } from './sanitizeHtml'

let editorConfigPromise: ReturnType<typeof editorConfigFactory.default> | undefined

type LegacyImage = {
  alt: string
  height?: string
  src: string
  title?: string
  width?: string
}

type ResolvedLegacyImage = {
  id: number | string
}

type ConvertHTMLToLexicalBodyOptions = {
  resolveImage?: (image: LegacyImage) => Promise<ResolvedLegacyImage>
}

function getEditorConfig() {
  editorConfigPromise ??= config.then((resolvedConfig) =>
    editorConfigFactory.default({ config: resolvedConfig }),
  )
  return editorConfigPromise
}

export async function convertHTMLToLexicalBody(
  html: string,
  options: ConvertHTMLToLexicalBodyOptions = {},
): Promise<SerializedEditorState> {
  const preparedHtml = await prepareLegacyHTMLForLexical(html, options)

  const body = await convertHTMLToLexical({
    editorConfig: await getEditorConfig(),
    html: preparedHtml,
    JSDOM,
  })

  coerceUploadValues(body)
  return body
}

export function canConvertHTMLToLexicalBody(html: string): boolean {
  const dom = new JSDOM(html)
  const images = Array.from(dom.window.document.querySelectorAll('img'))

  return images.every((image) => {
    const src = image.getAttribute('src') ?? ''
    return !src || isSafeImageSrc(src)
  })
}

async function prepareLegacyHTMLForLexical(
  html: string,
  { resolveImage }: ConvertHTMLToLexicalBodyOptions,
) {
  const dom = new JSDOM(sanitizeHtml(html))
  const images = Array.from(dom.window.document.querySelectorAll('img'))

  for (const image of images) {
    const src = image.getAttribute('src') ?? ''

    if (!src) {
      image.remove()
      continue
    }

    if (!isSafeImageSrc(src)) {
      throw new Error(`Unsafe legacy image URL: ${src || '(empty)'}`)
    }

    if (!resolveImage) {
      throw new Error(`Legacy image requires a media resolver: ${src}`)
    }

    const resolvedImage = await resolveImage({
      alt: image.getAttribute('alt') ?? '',
      height: image.getAttribute('height') ?? undefined,
      src,
      title: image.getAttribute('title') ?? undefined,
      width: image.getAttribute('width') ?? undefined,
    })

    image.setAttribute('data-lexical-upload-id', String(resolvedImage.id))
    image.setAttribute('data-lexical-upload-relation-to', 'media')
    image.removeAttribute('alt')
    image.removeAttribute('height')
    image.removeAttribute('src')
    image.removeAttribute('title')
    image.removeAttribute('width')
  }

  const body = dom.window.document.body
  return body.innerHTML
}

function isSafeImageSrc(src: string) {
  if (!src) return false

  try {
    const url = new URL(src)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return src.startsWith('/')
  }
}

function coerceUploadValues(node: unknown): void {
  if (!node || typeof node !== 'object') return

  const record = node as Record<string, unknown>
  if (record.type === 'upload' && typeof record.value === 'string' && /^\d+$/.test(record.value)) {
    record.value = Number(record.value)
  }

  if (Array.isArray(record.children)) {
    for (const child of record.children) {
      coerceUploadValues(child)
    }
  }

  if (record.root) {
    coerceUploadValues(record.root)
  }
}
