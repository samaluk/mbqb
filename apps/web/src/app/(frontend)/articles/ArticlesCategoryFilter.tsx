import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'

export type ArticlesCategoryFilterProps = {
  categories: string[]
  selectedCategory?: string
}

export function ArticlesCategoryFilter({
  categories,
  selectedCategory,
}: ArticlesCategoryFilterProps) {
  if (categories.length === 0) return null

  return (
    <nav
      aria-label="Filter by category"
      className="flex flex-wrap items-center gap-2"
      data-testid="articles-category-filter"
    >
      <Link
        className={cn(
          buttonVariants({
            size: 'sm',
            variant: !selectedCategory ? 'default' : 'outline',
          }),
          'rounded-full text-xs font-semibold',
        )}
        href="/articles"
      >
        All
      </Link>
      {categories.map((category) => {
        const isSelected = selectedCategory?.toLowerCase() === category.toLowerCase()
        return (
          <Link
            className={cn(
              buttonVariants({
                size: 'sm',
                variant: isSelected ? 'default' : 'outline',
              }),
              'rounded-full text-xs font-semibold',
            )}
            href={`/articles?category=${encodeURIComponent(category)}`}
            key={category}
          >
            {category}
          </Link>
        )
      })}
    </nav>
  )
}
