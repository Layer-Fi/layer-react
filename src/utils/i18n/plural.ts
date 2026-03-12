type TranslationOptions = Record<string, unknown>
type TranslateFn = (key: string, options: TranslationOptions) => string

export type PluralTranslationOptions = TranslationOptions & {
  count: number
  one: string
  other: string
}

export const tPlural = (
  translate: TranslateFn,
  key: string,
  { one, other, ...options }: PluralTranslationOptions,
): string => {
  return translate(key, {
    ...options,
    defaultValue_one: one,
    defaultValue_other: other,
  })
}
