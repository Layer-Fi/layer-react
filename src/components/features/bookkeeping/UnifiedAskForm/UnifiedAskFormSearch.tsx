import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type UnifiedSearchResult } from '@schemas/common/unifiedSearch'
import { type AskFormAnswer } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { AskFormSearchEntity } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { tConditional } from '@utils/shared/i18n/conditional'
import { useGetUnifiedSearch } from '@api/businesses/[business-id]/search/get'
import { CreatableComboBox } from '@ui/ComboBox/CreatableComboBox'
import { SearchComboBox, useSearchComboBox } from '@ui/ComboBox/SearchComboBox'
import { type ComboBoxOption } from '@ui/ComboBox/types'
import { type AskFormLabels } from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormUtils'

type UnifiedAskFormSearchProps = {
  taskId: string
  entity: string
  allowsFreeform: boolean
  optionValues: ReadonlyArray<string>
  prompt: string | null
  placeholder: string | null
  answer: AskFormAnswer | undefined
  labels: AskFormLabels
  onChange: (answer: AskFormAnswer) => void
  onLabel: (id: string, label: string) => void
}

const toComboBoxOption = ({ id, label }: UnifiedSearchResult): ComboBoxOption => ({ value: id, label })

const KNOWN_ENTITIES: Partial<Record<string, AskFormSearchEntity>> = {
  [AskFormSearchEntity.Category]: AskFormSearchEntity.Category,
  [AskFormSearchEntity.Vendor]: AskFormSearchEntity.Vendor,
  [AskFormSearchEntity.Customer]: AskFormSearchEntity.Customer,
}

const toEntityCondition = (entity: string) => KNOWN_ENTITIES[entity] ?? 'other'

export const UnifiedAskFormSearch = ({
  taskId,
  entity,
  allowsFreeform,
  optionValues,
  prompt,
  placeholder,
  answer,
  labels,
  onChange,
  onLabel,
}: UnifiedAskFormSearchProps) => {
  const { t } = useTranslation()
  const { searchQuery, isSearchEnabled, searchComboBoxProps } = useSearchComboBox()
  const { data: results, isLoading } = useGetUnifiedSearch({ entity, q: searchQuery, taskId, isEnabled: isSearchEnabled })

  const options = useMemo(() => (isSearchEnabled ? (results ?? []).map(toComboBoxOption) : []), [isSearchEnabled, results])

  const selectedValue = useMemo(() => {
    if (answer && 'choice' in answer && !optionValues.includes(answer.choice)) {
      return { value: answer.choice, label: labels[answer.choice] ?? answer.choice }
    }
    if (allowsFreeform && answer && 'text' in answer) {
      return { value: `text:${answer.text}`, label: answer.text }
    }
    return null
  }, [allowsFreeform, answer, labels, optionValues])

  const resolvedPlaceholder = placeholder ?? tConditional(t, 'bookkeeping:UnifiedAskForm.UnifiedAskFormSearch.placeholder.search_entity', {
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
  })

  const onSelect = (option: ComboBoxOption | null) => {
    if (!option) return

    onLabel(option.value, option.label)
    onChange({ choice: option.value })
  }

  const onCreate = (text: string) => onChange({ text })

  const formatCreateLabel = (text: string) =>
    t('bookkeeping:UnifiedAskForm.UnifiedAskFormSearch.action.use_typed_value', 'Use “{{text}}”', { text })

  if (allowsFreeform) {
    return (
      <CreatableComboBox
        aria-label={prompt ?? resolvedPlaceholder}
        placeholder={resolvedPlaceholder}
        options={options}
        selectedValue={selectedValue}
        onSelectedValueChange={onSelect}
        isClearable={false}
        isLoading={isLoading}
        filterOption={null}
        onInputValueChange={searchComboBoxProps.onSearchQueryChange}
        onCreateOption={onCreate}
        isValidNewOption={() => !isLoading}
        formatCreateLabel={formatCreateLabel}
        createOptionPosition='last'
      />
    )
  }

  return (
    <SearchComboBox
      aria-label={prompt ?? resolvedPlaceholder}
      placeholder={resolvedPlaceholder}
      options={options}
      selectedValue={selectedValue}
      onSelectedValueChange={onSelect}
      isClearable={false}
      isLoading={isLoading}
      {...searchComboBoxProps}
    />
  )
}
