import type { ComponentProps } from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { renderLexicalBodyToHTML } from '@/lib/lexicalBody'
import { cn } from '@/lib/utils'

type RichContentProps = Omit<ComponentProps<'div'>, 'children'> & {
  body?: SerializedEditorState | null
}

function RichContent({ body, className, ...props }: RichContentProps) {
  return (
    <div
      className={cn('rich-content', className)}
      dangerouslySetInnerHTML={{ __html: renderLexicalBodyToHTML(body) }}
      {...props}
    />
  )
}

export { RichContent }
