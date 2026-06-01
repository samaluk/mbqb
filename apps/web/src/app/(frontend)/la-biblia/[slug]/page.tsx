import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

const categoryLabels = {
  canchas: 'Canchas',
  'cultura-golf': 'Cultura golf',
  'diccionario-golfistico': 'Diccionario golfistico',
  equipo: 'Equipo',
  'primeros-pasos': 'Primeros pasos',
  'reglas-y-etiqueta': 'Reglas y etiqueta',
  'tecnica-basica': 'Tecnica basica',
}

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const articles = await payload.find({
    collection: 'la-biblia-articles',
    depth: 0,
    limit: 1,
    locale: 'es',
    where: {
      slug: {
        equals: slug,
      },
    },
  })
  const article = articles.docs[0]

  if (!article) notFound()

  return (
    <article className="mx-auto grid w-[min(1120px,calc(100%_-_48px))] gap-[18px] py-14 pb-24 max-[760px]:w-[min(calc(100%_-_24px),1120px)] max-[760px]:py-7 max-[760px]:pb-14">
      <Link className="w-fit text-[15px] font-extrabold text-green no-underline" href="/la-biblia">
        Volver a La Biblia
      </Link>
      <div className="text-sm font-extrabold uppercase text-green max-[760px]:text-xs">
        La Biblia
      </div>
      <h1 className="my-3 mb-0 max-w-[900px] text-[clamp(38px,6vw,74px)] leading-none max-[760px]:my-2 max-[760px]:mb-3 max-[760px]:text-[clamp(34px,11vw,48px)]">
        {article.title}
      </h1>
      <div className="flex flex-wrap gap-2 text-[13px] font-extrabold uppercase text-green max-[760px]:gap-1.5 max-[760px]:text-[11px]">
        <span className="rounded-full border border-green/20 px-2 py-[3px] max-[760px]:px-[7px] max-[760px]:py-0.5">
          {categoryLabels[article.category]}
        </span>
        <span className="rounded-full border border-green/20 px-2 py-[3px] max-[760px]:px-[7px] max-[760px]:py-0.5">
          {article.difficulty}
        </span>
      </div>
      <div className="rich-content" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
    </article>
  )
}
