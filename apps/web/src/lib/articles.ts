const articleDifficultyLabels: Record<string, string> = {
  advanced: 'Advanced',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
}

export function formatDifficulty(difficulty?: string | null): string {
  if (!difficulty) return ''
  return articleDifficultyLabels[difficulty] ?? difficulty
}
