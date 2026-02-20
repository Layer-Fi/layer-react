const DIRECTION_LABELS: Record<string, string> = {
  MONEY_IN: 'Money In',
  MONEY_OUT: 'Money Out',
}

export const getCategorizationRuleDirectionLabel = (bankDirectionFilter: string | null | undefined) => {
  if (!bankDirectionFilter) {
    return 'Any direction'
  }
  const normalized = bankDirectionFilter.replace(/\s+/g, '_').toUpperCase()
  return DIRECTION_LABELS[normalized] ?? bankDirectionFilter
}
