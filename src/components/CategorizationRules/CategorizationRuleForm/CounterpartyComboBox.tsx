import { useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { BankTransactionCounterparty } from '@schemas/bankTransactions/base'
import { useListCounterparties } from '@hooks/api/businesses/[business-id]/counterparties/useListCounterparties'
import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { CounterpartyComboBoxOption } from '@components/CategorizationRules/CategorizationRuleForm/counterpartyComboBoxOption'

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
  const { searchQuery, handleInputChange } = useDebouncedSearchInput({ initialInputState: '' })
  const { data, isLoading, isError: isListError } = useListCounterparties({
    q: searchQuery || undefined,
    limit: 50,
  })

  const fetchedOptions = useMemo<ReadonlyArray<CounterpartyComboBoxOption>>(() => {
    if (!data) return []
    return data.flatMap(({ data: page }) => page.map(counterparty => new CounterpartyComboBoxOption(counterparty)))
  }, [data])

  const slots = useMemo(() => {
    const wrapMessage = (message: string) => (
      <VStack pi='md'>
        <Span>{message}</Span>
      </VStack>
    )

    let EmptyMessage
    if (isListError) {
      EmptyMessage = wrapMessage(
        t('categorizationRules:error.load_counterparties', 'Couldn’t load counterparties. Please try again.'),
      )
    }
    else if (searchQuery === '') {
      EmptyMessage = wrapMessage(
        t(
          'categorizationRules:empty.no_counterparties_yet',
          'No counterparties yet. They will appear here automatically as your transactions are processed.',
        ),
      )
    }
    else {
      EmptyMessage = wrapMessage(
        t('categorizationRules:empty.no_matching_counterparties', 'No matching counterparties.'),
      )
    }

    return {
      EmptyMessage,
      ErrorMessage: (
        <Span size='xs' status='error'>
          {t('categorizationRules:validation.counterparty_required', 'Counterparty is required.')}
        </Span>
      ),
    }
  }, [isListError, searchQuery, t])

  const options = useMemo<ReadonlyArray<CounterpartyComboBoxOption>>(() => {
    if (!value) return fetchedOptions
    if (fetchedOptions.some(option => option.value === value.id)) return fetchedOptions
    return [new CounterpartyComboBoxOption(value), ...fetchedOptions]
  }, [fetchedOptions, value])

  const selectedOption = useMemo(() => {
    if (!value) return null
    return options.find(option => option.value === value.id) ?? null
  }, [options, value])

  const additionalAriaProps = !showLabel ? { 'aria-label': label } : {}

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
        onSelectedValueChange={option => onValueChange(option?.original ?? null)}
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
