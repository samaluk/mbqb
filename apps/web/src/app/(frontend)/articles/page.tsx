import { Suspense } from 'react'

import { Badge } from '@/components/ui/badge'
import { DocCard, PageGrid, PageKicker, PageLede, PageShell, PageTitle } from '@/components/page'
import { formatDifficulty } from '@/lib/articles'
import { filterArticlesByCategory, getArticleCategories } from '@/lib/articlesBrowsing'
import { getPayloadDocs } from '@/lib/payloadBySlug'

import { ArticlesCategoryFilter } from './ArticlesCategoryFilter'

export const metadata = { title: 'Articles' }

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function ArticlesPage({ searchParams }: PageProps) {
  return (
    <PageShell>
      <PageKicker>Articles</PageKicker>
      <PageTitle>Knowledge base and guides.</PageTitle>
      <PageLede>Explore articles, guides, and educational resources for our community.</PageLede>
      <Suspense fallback={null}>
        <ArticlesContent searchParams={searchParams} />
      </Suspense>
    </PageShell>
  )
}

async function ArticlesContent({ searchParams }: PageProps) {
  const params = await searchParams
  const selectedCategory = typeof params.category === 'string' ? params.category : undefined
  const articles = await getPayloadDocs('articles')

  const categories = getArticleCategories(articles)
  const filteredArticles = filterArticlesByCategory(articles, selectedCategory)

  return (
    <>
      <ArticlesCategoryFilter categories={categories} selectedCategory={selectedCategory} />
      <PageGrid>
        {filteredArticles.map((article) => (
          <DocCard
            badges={
              <>
                {article.category ? <Badge variant="outline">{article.category}</Badge> : null}
                <Badge variant="outline">{formatDifficulty(article.difficulty)}</Badge>
              </>
            }
            body={article.body}
            href={`/articles/${article.slug}`}
            key={article.id}
            linkLabel="Read article"
            title={article.title}
          />
        ))}
      </PageGrid>
    </>
  )
}
