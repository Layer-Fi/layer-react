import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { SplitAsOption } from '@internal-types/categorizationOption'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'

export const useSplitLabel = () => {
  const { t } = useTranslation()
  const { formatList } = useIntlFormatter()

  return useCallback(
    (split: SplitAsOption) => formatList(
      split.original.map(entry => entry.category?.label ?? t('common:label.uncategorized', 'Uncategorized')),
    ),
    [formatList, t],
  )
}
