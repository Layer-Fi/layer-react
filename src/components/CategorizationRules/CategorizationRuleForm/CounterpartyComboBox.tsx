import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { BankTransactionCounterparty } from '@schemas/bankTransactions/base'
import { useListCounterparties } from '@hooks/api/businesses/[business-id]/counterparties/useListCounterparties'
import { useDebounce } from '@hooks/utils/debouncing/useDebounce'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'

type CounterpartyOption = ComboBoxOption & {
  counterparty: BankTransactionCounterparty
}

const counterpartyToOption = (counterparty: BankTransactionCounterparty): CounterpartyOption => ({
  label: counterparty.name ?? counterparty.id,
  value: counterparty.id,
  counterparty,
})

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
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debouncedSetQuery = useDebounce(setDebouncedQuery)
  const { data, isLoading } = useListCounterparties({
    q: debouncedQuery || undefined,
    limit: 50,
  })

  const fetchedOptions = useMemo<ReadonlyArray<CounterpartyOption>>(() => {
    if (!data) return []
    return data.flatMap(({ data: page }) => page.map(counterpartyToOption))
  }, [data])

  const slots = useMemo(() => {
    if (debouncedQuery === '' && !isLoading && fetchedOptions.length === 0) {
      return {
        EmptyMessage: (
          <VStack pi='md'>
            <Span>
              {t(
                'categorizationRules:empty.no_counterparties_yet',
                'No counterparties yet. They will appear here automatically as your transactions are processed.',
              )}
            </Span>
          </VStack>
        ),
      }
    }
    return undefined
  }, [debouncedQuery, isLoading, fetchedOptions.length, t])

  const options = useMemo<ReadonlyArray<CounterpartyOption>>(() => {
    if (!value) return fetchedOptions
    if (fetchedOptions.some(option => option.value === value.id)) return fetchedOptions
    return [counterpartyToOption(value), ...fetchedOptions]
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
        onSelectedValueChange={option => onValueChange(option?.counterparty ?? null)}
        onInputValueChange={debouncedSetQuery}
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
