import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type UnifiedSearchResult } from '@schemas/common/unifiedSearch'
import { AskFormSearchEntity, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { tConditional } from '@utils/shared/i18n/conditional'
import { useGetUnifiedSearch } from '@api/businesses/[business-id]/search/get'
import { useSearchComboBox } from '@ui/ComboBox/SearchComboBox'
import { type ComboBoxOption } from '@ui/ComboBox/types'
import { type ChoiceStepSearch } from '@blocks/FormSteps/ChoiceStep'
import { type AskFormStepFields } from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormUtils'

const toComboBoxOption = ({ id, label }: UnifiedSearchResult): ComboBoxOption => ({ value: id, label })

const KNOWN_ENTITIES: Partial<Record<string, AskFormSearchEntity>> = {
  [AskFormSearchEntity.Category]: AskFormSearchEntity.Category,
  [AskFormSearchEntity.Vendor]: AskFormSearchEntity.Vendor,
  [AskFormSearchEntity.Customer]: AskFormSearchEntity.Customer,
}

const toEntityCondition = (entity: string) => KNOWN_ENTITIES[entity] ?? 'other'

const getSearchConfig = (step: AskFormStepFields) => {
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

/** Search props for the step's `ChoiceStep`, or undefined when the step has no search. */
export const useUnifiedAskFormSearch = (taskId: string, step: AskFormStepFields): ChoiceStepSearch | undefined => {
  const { t } = useTranslation()
  const config = getSearchConfig(step)
  const entity = config?.entity ?? AskFormSearchEntity.Category

  const { searchQuery, isSearchEnabled, searchComboBoxProps } = useSearchComboBox()
  const { data: results, isLoading } = useGetUnifiedSearch({
    entity,
    q: searchQuery,
    taskId,
    isEnabled: config !== null && isSearchEnabled,
  })

  const options = useMemo(() => (isSearchEnabled ? (results ?? []).map(toComboBoxOption) : []), [isSearchEnabled, results])

  if (!config) return undefined

  return {
    options,
    isLoading,
    onSearchQueryChange: searchComboBoxProps.onSearchQueryChange,
    allowCreate: config.allowCreate,
    formatCreateLabel: text =>
      t('bookkeeping:UnifiedAskForm.useUnifiedAskFormSearch.action.use_typed_value', 'Use “{{text}}”', { text }),
    placeholder: config.placeholder ?? tConditional(t, 'bookkeeping:UnifiedAskForm.useUnifiedAskFormSearch.placeholder.search_entity', {
      condition: toEntityCondition(entity),
      cases: {
        [AskFormSearchEntity.Category]: 'Search categories…',
        [AskFormSearchEntity.Vendor]: 'Search vendors…',
        [AskFormSearchEntity.Customer]: 'Search customers…',
        other: 'Search…',
      },
      contexts: {
        [AskFormSearchEntity.Category]: 'category',
        [AskFormSearchEntity.Vendor]: 'vendor',
        [AskFormSearchEntity.Customer]: 'customer',
        other: 'other',
      },
    }),
  }
}
