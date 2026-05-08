import { useCallback } from 'react'
import { GridList } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import {
  BankTransactionsMobileCategorySelectionItem,
  type BankTransactionsMobileCategorySelectionItemOption,
} from './BankTransactionsMobileCategorySelectionItem'

import './bankTransactionsMobileCategorySelection.scss'

interface BankTransactionsMobileCategorySelectionProps {
  options: BankTransactionsMobileCategorySelectionItemOption[]
  selectedId?: string
  showDescriptions?: boolean
  onSelect: (option: BankTransactionsMobileCategorySelectionItemOption) => void
  readOnly?: boolean
}

export const BankTransactionsMobileCategorySelection = ({
  options,
  selectedId,
  onSelect,
  readOnly,
}: BankTransactionsMobileCategorySelectionProps) => {
  const { t } = useTranslation()
  const handleSelectionChange = useCallback((keys: Set<string | number> | 'all') => {
    if (readOnly) return

    const selectedKey = [...keys][0]
    const selectedOption = options.find(opt => opt.value.value === selectedKey)
    if (selectedOption) {
      onSelect(selectedOption)
    }
  }, [options, onSelect, readOnly])

  return (
    <VStack gap='sm'>
      <Span size='sm' weight='bold'>
        {t('bankTransactions:action.select_category', 'Select category')}
      </Span>
      <GridList
        aria-label={t('bankTransactions:action.select_a_category', 'Select a category')}
        selectionMode='single'
        selectedKeys={selectedId ? new Set([selectedId]) : new Set()}
        onSelectionChange={handleSelectionChange}
        className='Layer__BankTransactionsMobileCategorySelection'
      >
        {options.map(option => (
          <BankTransactionsMobileCategorySelectionItem
            key={option.value.value}
            option={option}
          />
        ))}
      </GridList>
    </VStack>
  )
}
