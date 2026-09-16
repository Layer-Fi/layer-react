import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { useDebounce } from '@hooks/utils/debouncing/useDebounce'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { useBankTransactionsFiltersContext } from '@providers/features/bankTransactions/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { SearchField } from '@ui/SearchField/SearchField'

type TransactionsSearchProps = {
  slot?: string
  isDisabled?: boolean
}

export function BankTransactionsSearchField({ slot, isDisabled }: TransactionsSearchProps) {
  const { t } = useTranslation()
  const { filters, setFilters } = useBankTransactionsFiltersContext()
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.BankTransactions)

  const [localSearch, setLocalSearch] = useState(() => filters?.query ?? '')

  const debouncedSetDescription = useDebounce((value: string) => {
    if (value === (filters?.query ?? '')) return

    setFilters({ query: value })

    emitLayerEvent({
      type: LayerEventType.TransactionsSearchSubmitted,
      version: 1,
      payload: { query: value },
    })
  })

  const handleSearch = useCallback((value: string) => {
    setLocalSearch(value)

    void debouncedSetDescription(value)
  }, [debouncedSetDescription])

  return (
    <SearchField
      slot={slot}
      label={t('bankTransactions:BankTransactionsSearchField.label.search_transactions', 'Search transactions')}
      value={localSearch}
      onChange={handleSearch}
      isDisabled={isDisabled}
    />
  )
}
