import { MetaPills, PayloadDocDetail, RichContent, type SlugPageProps } from '@/components/page'
import { laBibliaCategoryLabels } from '@/lib/laBiblia'
import { payloadDocMetadata } from '@/lib/payloadBySlug'

export const generateMetadata = payloadDocMetadata('la-biblia-articles', 'La Biblia · MBQB')

export default function ArticleDetailPage({ params }: SlugPageProps) {
  return (
    <PayloadDocDetail
      backHref="/la-biblia"
      backLabel="Volver a La Biblia"
      backTestId="article-detail-back-link"
      collection="la-biblia-articles"
      kicker="La Biblia"
      params={params}
      titleTestId="article-detail-title"
    >
      {(article) => (
        <>
          <MetaPills items={[laBibliaCategoryLabels[article.category], article.difficulty]} />
          <RichContent body={article.body} />
        </>
      )}
    </PayloadDocDetail>
  )
}
