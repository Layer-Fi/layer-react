import i18next from 'i18next'

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

export const i18nextPlural = (
  key: string,
  options: PluralTranslationOptions,
): string => {
  return tPlural((translationKey, translationOptions) => i18next.t(translationKey, translationOptions), key, options)
}
