type TranslationOptions = Record<string, unknown>
type TranslateFn = (key: string, options: TranslationOptions) => string

export type ConditionalTranslationOptions<TCondition extends string> = TranslationOptions & {
  condition: TCondition
  cases: Record<TCondition, string>
  contexts?: Partial<Record<TCondition, string>>
}

export const tConditional = <TCondition extends string>(
  translate: TranslateFn,
  key: string,
  { condition, cases, contexts, ...options }: ConditionalTranslationOptions<TCondition>,
): string => {
  return translate(key, {
    ...options,
    context: contexts?.[condition],
    defaultValue: cases[condition],
  })
}
