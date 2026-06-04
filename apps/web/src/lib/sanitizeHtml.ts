const allowedTags = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'div',
  'em',
  'h2',
  'h3',
  'h4',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'span',
  'strong',
  'u',
  'ul',
])

const globalAttributes = new Set(['class'])
const allowedAttributesByTag: Record<string, Set<string>> = {
  a: new Set(['href', 'rel', 'target', 'title']),
  img: new Set(['alt', 'height', 'src', 'title', 'width']),
}

const voidTags = new Set(['br', 'img'])
const tagPattern = /<\/?([a-zA-Z][\w:-]*)(?:\s[^<>]*)?>/g
const unsafeBlockPattern = /<\s*(script|style)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi
const attributePattern = /([^\s"'=<>`]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

export function sanitizeHtml(html: string): string {
  return html.replace(unsafeBlockPattern, '').replace(tagPattern, (tag, rawTagName) => {
    const tagName = rawTagName.toLowerCase()

    if (!allowedTags.has(tagName)) return ''

    const isClosingTag = /^<\s*\//.test(tag)
    if (isClosingTag) {
      return voidTags.has(tagName) ? '' : `</${tagName}>`
    }

    const attributes = sanitizeAttributes(tag, tagName)

    return `<${tagName}${attributes}${voidTags.has(tagName) ? ' /' : ''}>`
  })
}

function sanitizeAttributes(tag: string, tagName: string) {
  const attributeText = tag
    .replace(/^<\s*\/?\s*[a-zA-Z][\w:-]*/, '')
    .replace(/\/?\s*>$/, '')

  let sanitized = ''

  for (const match of attributeText.matchAll(attributePattern)) {
    const name = match[1]?.toLowerCase()
    if (!name || name.startsWith('on')) continue

    const value = match[3] ?? match[4] ?? match[5] ?? ''
    if (!isAllowedAttribute(tagName, name, value)) continue

    sanitized += ` ${name}="${escapeAttribute(value)}"`
  }

  return sanitized
}

function isAllowedAttribute(tagName: string, name: string, value: string) {
  const allowedForTag = allowedAttributesByTag[tagName]

  if (!globalAttributes.has(name) && !allowedForTag?.has(name)) return false

  if ((name === 'href' || name === 'src') && !isSafeUrl(value)) return false

  if (tagName === 'a' && name === 'target' && value !== '_blank') return false

  return true
}

function isSafeUrl(value: string) {
  const normalized = value.trim().replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase()

  return (
    normalized.startsWith('/') ||
    normalized.startsWith('#') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('mailto:')
  )
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
