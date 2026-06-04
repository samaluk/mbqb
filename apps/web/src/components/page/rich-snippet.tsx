import type { ComponentProps } from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { renderLexicalBodyToHTML } from '@/lib/lexicalBody'
import { cn } from '@/lib/utils'

type RichSnippetProps = Omit<ComponentProps<'div'>, 'children'> & {
  body?: SerializedEditorState | null
  fallbackHtml: string
}

function RichSnippet({ body, className, fallbackHtml, ...props }: RichSnippetProps) {
  return (
    <div
      className={cn(
        'line-clamp-4 overflow-hidden text-base text-muted max-[760px]:line-clamp-2 max-[760px]:text-sm max-[760px]:leading-[1.4]',
        '[&_div]:m-0 [&_div]:!font-[inherit] [&_div]:!text-[inherit]',
        '[&_p]:m-0 [&_p]:!font-[inherit] [&_p]:!text-[inherit]',
        '[&_span]:m-0 [&_span]:!font-[inherit] [&_span]:!text-[inherit]',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: renderLexicalBodyToHTML(body, fallbackHtml) }}
      {...props}
    />
  )
}

export { RichSnippet }
