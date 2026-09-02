/**
 * Extracts a sorted, unique list of non-empty category names from a collection of articles.
 */
export function getArticleCategories(articles: { category?: string | null }[]): string[] {
  const categories = new Map<string, string>()

  for (const article of articles) {
    const trimmed = article.category?.trim()
    if (trimmed) {
      const normalized = trimmed.toLowerCase()
      if (!categories.has(normalized)) {
        categories.set(normalized, trimmed)
      }
    }
  }

  return Array.from(categories.values()).toSorted((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  )
}

/**
 * Filters a collection of articles by category (case-insensitive).
 * When no category is specified or empty/all, returns all articles.
 */
export function filterArticlesByCategory<T extends { category?: string | null }>(
  articles: T[],
  category?: string | null,
): T[] {
  const normalizedCategory = category?.trim().toLowerCase()
  if (!normalizedCategory || normalizedCategory === 'all') {
    return articles
  }

  return articles.filter((article) => article.category?.trim().toLowerCase() === normalizedCategory)
}
