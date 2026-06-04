import type { ComponentProps } from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { renderLexicalBodyToHTML } from '@/lib/lexicalBody'
import { cn } from '@/lib/utils'

type RichSnippetProps = Omit<ComponentProps<'div'>, 'children'> & {
  body?: SerializedEditorState | null
}

function RichSnippet({ body, className, ...props }: RichSnippetProps) {
  return (
    <div
      className={cn('rich-snippet', className)}
      dangerouslySetInnerHTML={{ __html: renderLexicalBodyToHTML(body) }}
      {...props}
    />
  )
}

export { RichSnippet }
