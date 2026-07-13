import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useEmitLayerEvent } from '@hooks/useEmitLayerEvent'
import { useDebounce } from '@hooks/utils/debouncing/useDebounce'
import { LayerEventComponent, LayerEventType } from '@providers/LayerProvider/layerEvents'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { SearchField } from '@components/SearchField/SearchField'

type TransactionsSearchProps = {
  slot?: string
  isDisabled?: boolean
}

export function TransactionsSearch({ slot, isDisabled }: TransactionsSearchProps) {
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
      label={t('bankTransactions:label.search_transactions', 'Search transactions')}
      value={localSearch}
      onChange={handleSearch}
      isDisabled={isDisabled}
    />
  )
}
