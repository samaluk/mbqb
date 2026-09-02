import { MetaPills, PayloadDocDetail, RichContent, type SlugPageProps } from '@/components/page'
import { formatDifficulty } from '@/lib/articles'
import { payloadDocMetadata } from '@/lib/payloadBySlug'

export const generateMetadata = payloadDocMetadata('articles', 'Articles')

export default function ArticleDetailPage({ params }: SlugPageProps) {
  return (
    <PayloadDocDetail
      backHref="/articles"
      backLabel="Back to articles"
      backTestId="article-detail-back-link"
      collection="articles"
      kicker="Articles"
      params={params}
      titleTestId="article-detail-title"
    >
      {(article) => (
        <>
          <MetaPills
            items={[article.category, formatDifficulty(article.difficulty)].filter(
              (item): item is string => Boolean(item),
            )}
          />
          <RichContent body={article.body} />
        </>
      )}
    </PayloadDocDetail>
  )
}
