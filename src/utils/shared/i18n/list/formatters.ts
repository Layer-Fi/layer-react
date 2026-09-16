import type { IntlShape } from 'react-intl'

export type ListFormatFn = (labels: readonly string[], options?: Intl.ListFormatOptions) => string

const formatLabelList = (labels: readonly string[], locale: string, options?: Intl.ListFormatOptions): string => {
  if (labels.length === 0) return ''

  return new Intl.ListFormat(locale, { style: 'long', type: 'conjunction', ...options }).format(labels)
}

export const formatList = (intl: IntlShape, labels: readonly string[], options?: Intl.ListFormatOptions): string =>
  formatLabelList(labels, intl.locale, options)
