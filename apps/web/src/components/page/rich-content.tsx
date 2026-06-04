import type { ComponentProps } from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { renderLexicalBodyToHTML } from '@/lib/lexicalBody'
import { cn } from '@/lib/utils'

type RichContentProps = Omit<ComponentProps<'div'>, 'children'> & {
  body?: SerializedEditorState | null
  fallbackHtml: string
}

function RichContent({ body, className, fallbackHtml, ...props }: RichContentProps) {
  return (
    <div
      className={cn(
        'mt-1 grid max-w-[780px] gap-3 text-ink max-[760px]:gap-2.5',
        '[&_blockquote]:m-0 [&_blockquote]:max-w-none [&_blockquote]:text-[17px] [&_blockquote]:leading-[1.48] [&_blockquote]:text-ink',
        '[&_h2]:mt-3 [&_h2]:mb-0 [&_h2]:leading-[1.1] [&_h3]:mt-3 [&_h3]:mb-0 [&_h3]:leading-[1.1] [&_h4]:mt-3 [&_h4]:mb-0 [&_h4]:leading-[1.1]',
        '[&_ol]:m-0 [&_ol]:max-w-none [&_ol]:text-[17px] [&_ol]:leading-[1.48] [&_ol]:text-ink',
        '[&_p]:m-0 [&_p]:max-w-none [&_p]:text-[17px] [&_p]:leading-[1.48] [&_p]:text-ink',
        '[&_ul]:m-0 [&_ul]:max-w-none [&_ul]:text-[17px] [&_ul]:leading-[1.48] [&_ul]:text-ink',
        '[&_a]:font-extrabold [&_a]:text-green',
        '[&_img]:h-auto [&_img]:w-[min(100%,720px)] [&_img]:rounded-lg',
        'max-[760px]:[&_blockquote]:text-[15px] max-[760px]:[&_blockquote]:leading-[1.42]',
        'max-[760px]:[&_ol]:text-[15px] max-[760px]:[&_ol]:leading-[1.42]',
        'max-[760px]:[&_p]:text-[15px] max-[760px]:[&_p]:leading-[1.42]',
        'max-[760px]:[&_ul]:text-[15px] max-[760px]:[&_ul]:leading-[1.42]',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: renderLexicalBodyToHTML(body, fallbackHtml) }}
      {...props}
    />
  )
}

export { RichContent }
