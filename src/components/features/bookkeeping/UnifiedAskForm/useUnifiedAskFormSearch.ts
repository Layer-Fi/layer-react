import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type UnifiedSearchResult } from '@schemas/common/unifiedSearch'
import { AskFormSearchEntity, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { tConditional } from '@utils/shared/i18n/conditional'
import { useGetUnifiedSearch } from '@api/businesses/[business-id]/search/get'
import { useSearchComboBox } from '@ui/ComboBox/SearchComboBox'
import { type ComboBoxOption } from '@ui/ComboBox/types'
import { type UnifiedAskFormChoiceStepSearch } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormChoiceStep'
import { type AskFormStepFields } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

const toComboBoxOption = ({ id, label }: UnifiedSearchResult): ComboBoxOption => ({ value: id, label })

const isKnownEntity = (entity: string): entity is AskFormSearchEntity =>
  Object.values<string>(AskFormSearchEntity).includes(entity)

// The key extractor only reads literal property names, so `cases` and `contexts` cannot use enum-computed keys.
const SEARCH_ENTITY_CONDITIONS = {
  [AskFormSearchEntity.Category]: 'category',
  [AskFormSearchEntity.Vendor]: 'vendor',
  [AskFormSearchEntity.Customer]: 'customer',
} as const

export type AskFormSearchConfig = {
  entity: string
  allowCreate: boolean
  placeholder: string | null
}

/** How a step searches, or null when it has no search. */
export const getSearchConfig = (step: AskFormStepFields): AskFormSearchConfig | null => {
  switch (step.type) {
    case AskFormStepType.Search:
    case AskFormStepType.SearchWithFreeform:
      return {
        entity: step.entity,
        allowCreate: step.type === AskFormStepType.SearchWithFreeform,
        placeholder: step.placeholder ?? null,
      }
    case AskFormStepType.Category:
      return step.search || step.options.length === 0
        ? { entity: AskFormSearchEntity.Category, allowCreate: false, placeholder: null }
        : null
    default:
      return null
  }
}

/** Search props for a searchable step's `UnifiedAskFormChoiceStep`. */
export const useUnifiedAskFormSearch = (taskId: string, { entity, allowCreate, placeholder }: AskFormSearchConfig): UnifiedAskFormChoiceStepSearch => {
  const { t } = useTranslation()
  const { searchQuery, isSearchEnabled, searchComboBoxProps } = useSearchComboBox()
  const { trigger: search, data: results, isMutating, isError } = useGetUnifiedSearch()

  useEffect(() => {
    if (isSearchEnabled) search({ entity, q: searchQuery, taskId }).catch(() => undefined)
  }, [entity, isSearchEnabled, search, searchQuery, taskId])

  const options = useMemo(() => (isSearchEnabled ? (results ?? []).map(toComboBoxOption) : []), [isSearchEnabled, results])

  return {
    options,
    isLoading: isMutating,
    isSearchError: isError,
    searchErrorMessage: t('bookkeeping:UnifiedAskForm.useUnifiedAskFormSearch.error.search_failed', 'Search didn’t work. Try again.'),
    onSearchQueryChange: searchComboBoxProps.onSearchQueryChange,
    allowCreate,
    formatCreateLabel: text =>
      t('bookkeeping:UnifiedAskForm.useUnifiedAskFormSearch.action.use_typed_value', 'Use “{{text}}”', { text }),
    placeholder: placeholder ?? tConditional(t, 'bookkeeping:UnifiedAskForm.useUnifiedAskFormSearch.placeholder.search_entity', {
      condition: isKnownEntity(entity) ? SEARCH_ENTITY_CONDITIONS[entity] : 'other',
      cases: {
        category: 'Search categories…',
        vendor: 'Search vendors…',
        customer: 'Search customers…',
        other: 'Search…',
      },
      contexts: {
        category: 'category',
        vendor: 'vendor',
        customer: 'customer',
        other: 'other',
      },
    }),
  }
}
