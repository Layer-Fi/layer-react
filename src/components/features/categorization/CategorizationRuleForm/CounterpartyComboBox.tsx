import { useCallback, useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { BankTransactionCounterparty } from '@schemas/features/bankTransactions/base'
import { SearchComboBox, useSearchComboBox } from '@ui/ComboBox/SearchComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import {
  type CounterpartyOption,
  isTransactionDescriptionOption,
  toCounterpartyValue,
} from '@features/categorization/CategorizationRuleForm/counterpartyComboBoxOption'
import { useCounterpartyOptions } from '@features/categorization/CategorizationRuleForm/useCounterpartyOptions'

type CounterpartyComboBoxProps = {
  label: string
  value: BankTransactionCounterparty | null
  onValueChange: (counterparty: BankTransactionCounterparty | null) => void
  showLabel?: boolean
  isReadOnly?: boolean
  isError?: boolean
  placeholder?: string
  transactionDescription?: string | null
}

export const CounterpartyComboBox = ({
  label,
  value,
  onValueChange,
  showLabel,
  isReadOnly,
  isError,
  placeholder,
  transactionDescription,
}: CounterpartyComboBoxProps) => {
  const { t } = useTranslation()
  const inputId = useId()
  const { searchQuery, searchComboBoxProps } = useSearchComboBox({ minQueryLength: 0 })
  const {
    options,
    selectedOption,
    isLoading,
    isError: isListError,
  } = useCounterpartyOptions({ value, searchQuery, transactionDescription })

  const slots = useMemo(() => {
    let emptyMessageContent = t('categorization:CategorizationRuleForm.empty.no_matching_counterparties', 'No matching counterparties.')
    if (isListError) {
      emptyMessageContent = t('categorization:CategorizationRuleForm.error.load_counterparties', 'Couldn’t load counterparties. Please try again.')
    }
    else if (searchQuery === '') {
      emptyMessageContent = t(
        'categorization:CategorizationRuleForm.empty.no_counterparties_yet',
        'No counterparties yet. They will appear here automatically as your transactions are processed.',
      )
    }

    return {
      EmptyMessage: (
        <VStack pi='md'>
          <Span>{emptyMessageContent}</Span>
        </VStack>
      ),
      ErrorMessage: t('categorization:CategorizationRuleForm.validation.counterparty_required', 'Counterparty is required.'),
    }
  }, [isListError, searchQuery, t])

  const additionalAriaProps = useMemo(
    () => (showLabel ? {} : { 'aria-label': label }),
    [showLabel, label],
  )

  const handleSelectedValueChange = useCallback(
    (option: CounterpartyOption | null) => {
      onValueChange(toCounterpartyValue(option))
    },
    [onValueChange],
  )

  return (
    <VStack gap='3xs'>
      {showLabel && (
        <Label size='sm' htmlFor={inputId}>
          {label}
        </Label>
      )}
      <SearchComboBox<CounterpartyOption>
        {...searchComboBoxProps}
        options={options}
        selectedValue={selectedOption}
        onSelectedValueChange={handleSelectedValueChange}
        isClearable={!isTransactionDescriptionOption(selectedOption)}
        inputId={inputId}
        isLoading={isLoading}
        isReadOnly={isReadOnly}
        isError={isError}
        placeholder={placeholder}
        slots={slots}
        {...additionalAriaProps}
      />
    </VStack>
  )
}
