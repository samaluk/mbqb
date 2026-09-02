import { describe, expect, it } from 'vitest'

import { formatDifficulty } from '@/lib/articles'
import { filterArticlesByCategory, getArticleCategories } from '@/lib/articlesBrowsing'

describe('articles browsing & categorization', () => {
  const sampleArticles = [
    {
      category: 'Rules',
      difficulty: 'beginner' as const,
      id: 1,
      slug: 'intro-to-rules',
      title: 'Intro to Rules',
    },
    {
      category: 'Etiquette',
      difficulty: 'intermediate' as const,
      id: 2,
      slug: 'course-etiquette',
      title: 'Course Etiquette',
    },
    {
      category: 'rules', // same category with different casing should be deduplicated
      difficulty: 'advanced' as const,
      id: 3,
      slug: 'advanced-rules',
      title: 'Advanced Rules',
    },
    {
      category: '',
      difficulty: 'beginner' as const,
      id: 4,
      slug: 'uncategorized-article',
      title: 'Uncategorized Article',
    },
    {
      category: null,
      difficulty: 'beginner' as const,
      id: 5,
      slug: 'null-category-article',
      title: 'Null Category Article',
    },
  ]

  it('extracts case-insensitively unique, sorted, non-empty categories', () => {
    const categories = getArticleCategories(sampleArticles)

    expect(categories).toEqual(['Etiquette', 'Rules'])
  })

  it('retains the first encountered trimmed display form for duplicate categories', () => {
    const categories = getArticleCategories([
      { category: '  putting  ' },
      { category: 'PUTTING' },
      { category: 'Putting' },
    ])

    expect(categories).toEqual(['putting'])
  })

  it('filters articles by category case-insensitively', () => {
    const rulesArticles = filterArticlesByCategory(sampleArticles, 'rules')
    expect(rulesArticles).toHaveLength(2)
    expect(rulesArticles.map((a) => a.id)).toEqual([1, 3])

    const etiquetteArticles = filterArticlesByCategory(sampleArticles, 'ETIQUETTE')
    expect(etiquetteArticles).toHaveLength(1)
    expect(etiquetteArticles[0]?.id).toBe(2)
  })

  it('returns all articles when category is not specified, empty, or "all"', () => {
    expect(filterArticlesByCategory(sampleArticles, undefined)).toEqual(sampleArticles)
    expect(filterArticlesByCategory(sampleArticles, '')).toEqual(sampleArticles)
    expect(filterArticlesByCategory(sampleArticles, '  ')).toEqual(sampleArticles)
    expect(filterArticlesByCategory(sampleArticles, 'all')).toEqual(sampleArticles)
    expect(filterArticlesByCategory(sampleArticles, 'ALL')).toEqual(sampleArticles)
  })

  it('formats standard difficulty options into generic English display labels', () => {
    expect(formatDifficulty('beginner')).toBe('Beginner')
    expect(formatDifficulty('intermediate')).toBe('Intermediate')
    expect(formatDifficulty('advanced')).toBe('Advanced')
    expect(formatDifficulty(null)).toBe('')
    expect(formatDifficulty(undefined)).toBe('')
    expect(formatDifficulty('custom-difficulty')).toBe('custom-difficulty')
  })
})
