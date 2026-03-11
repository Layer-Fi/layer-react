import { tConditional } from '@utils/i18n/conditional'

type TranslationOptions = Record<string, unknown>
type TranslateFn = (key: string, options: TranslationOptions) => string

type ProjectedLabelOptions = TranslationOptions & {
  key: string
  isProjected: boolean
  defaultCase: string
  projectedCase: string
}

export const maybeAddProjectedToLabel = (
  translate: TranslateFn,
  {
    key,
    isProjected,
    defaultCase,
    projectedCase,
    ...options
  }: ProjectedLabelOptions,
): string => {
  const projectedCondition: 'projected' | 'default' = isProjected ? 'projected' : 'default'

  return tConditional(translate, key, {
    ...options,
    condition: projectedCondition,
    cases: {
      default: defaultCase,
      projected: projectedCase,
    },
    contexts: {
      projected: 'projected',
    },
  })
}
