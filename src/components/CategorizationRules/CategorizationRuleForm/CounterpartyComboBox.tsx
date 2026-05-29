import { useCallback, useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { BankTransactionCounterparty } from '@schemas/bankTransactions/base'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { type CounterpartyComboBoxOption } from '@components/CategorizationRules/CategorizationRuleForm/counterpartyComboBoxOption'
import { useCounterpartyOptions } from '@components/CategorizationRules/CategorizationRuleForm/useCounterpartyOptions'

type CounterpartyComboBoxProps = {
  label: string
  value: BankTransactionCounterparty | null
  onValueChange: (counterparty: BankTransactionCounterparty | null) => void
  showLabel?: boolean
  isReadOnly?: boolean
  isError?: boolean
  placeholder?: string
}

export const CounterpartyComboBox = ({
  label,
  value,
  onValueChange,
  showLabel,
  isReadOnly,
  isError,
  placeholder,
}: CounterpartyComboBoxProps) => {
  const { t } = useTranslation()
  const inputId = useId()
  const {
    searchQuery,
    handleInputChange,
    options,
    selectedOption,
    isLoading,
    isError: isListError,
  } = useCounterpartyOptions(value)

  const slots = useMemo(() => {
    let emptyMessageContent = t('categorizationRules:empty.no_matching_counterparties', 'No matching counterparties.')
    if (isListError) {
      emptyMessageContent = t('categorizationRules:error.load_counterparties', 'Couldn’t load counterparties. Please try again.')
    }
    else if (searchQuery === '') {
      emptyMessageContent = t(
        'categorizationRules:empty.no_counterparties_yet',
        'No counterparties yet. They will appear here automatically as your transactions are processed.',
      )
    }

    return {
      EmptyMessage: (
        <VStack pi='md'>
          <Span>{emptyMessageContent}</Span>
        </VStack>
      ),
      ErrorMessage: (
        <Span size='xs' status='error'>
          {t('categorizationRules:validation.counterparty_required', 'Counterparty is required.')}
        </Span>
      ),
    }
  }, [isListError, searchQuery, t])

  const additionalAriaProps = useMemo(
    () => (showLabel ? {} : { 'aria-label': label }),
    [showLabel, label],
  )

  const handleSelectedValueChange = useCallback(
    (option: CounterpartyComboBoxOption | null) => {
      onValueChange(option?.original ?? null)
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
      <ComboBox
        options={options}
        selectedValue={selectedOption}
        onSelectedValueChange={handleSelectedValueChange}
        onInputValueChange={handleInputChange}
        filterOption={null}
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
