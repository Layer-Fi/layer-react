import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { ActionableList, type ActionableListOption } from '@components/ActionableList/ActionableList'
import { SearchField } from '@components/SearchField/SearchField'

import { NO_TAX_CODE } from './constants'

export type TaxCodeSelectOption = ComboBoxOption

type TaxCodeSelectDrawerProps = {
  options: TaxCodeSelectOption[]
  selectedId?: string
  onSelect: (value: TaxCodeSelectOption | null) => void
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const TaxCodeSelectDrawer = ({
  options,
  selectedId,
  onSelect,
  isOpen,
  onOpenChange,
}: TaxCodeSelectDrawerProps) => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const listOptions: ActionableListOption<TaxCodeSelectOption | null>[] = useMemo(() => {
    return [
      ...options.map(option => ({
        id: option.value,
        label: option.label,
        value: option,
      })),
      {
        id: NO_TAX_CODE,
        label: t('bankTransactions:action.no_tax_code', 'No tax code'),
        value: null,
      },
    ]
  }, [options, t])

  const queryTrimmed = query.trim().toLowerCase()
  const filteredListOptions = useMemo(
    () => queryTrimmed
      ? listOptions.filter(opt => opt.label.toLowerCase().includes(queryTrimmed))
      : listOptions,
    [listOptions, queryTrimmed],
  )

  const handleOpenChange = useCallback((nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      setQuery('')
    }
    onOpenChange(nextIsOpen)
  }, [onOpenChange])

  const Header = useCallback(({ close }: { close: () => void }) => (
    <ModalTitleWithClose
      heading={<ModalHeading size='sm' weight='bold'>{t('bankTransactions:action.select_tax_code', 'Select tax code')}</ModalHeading>}
      onClose={close}
      hideBottomPadding
    />
  ), [t])

  return (
    <Drawer
      slots={{ Header }}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      variant='mobile-drawer'
      fixedHeight
      isDismissable
    >
      {({ close }) => (
        <VStack className='Layer__bank-transaction-mobile-list-item__categories_list-container' pb='md' gap='md'>
          <SearchField value={query} onChange={setQuery} label={t('bankTransactions:action.search_tax_codes', 'Search tax codes...')} />
          <ActionableList<TaxCodeSelectOption | null>
            options={filteredListOptions}
            onClick={(item) => {
              if (item.id === NO_TAX_CODE) {
                onSelect(null)
              }
              else {
                onSelect(item.value)
              }
              close()
            }}
            selectedId={selectedId}
            className='Layer__bank-transaction-mobile-list-item__categories_list'
          />
        </VStack>
      )}
    </Drawer>
  )
}
