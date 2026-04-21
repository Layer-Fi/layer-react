import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { ActionableList, type ActionableListOption } from '@components/ActionableList/ActionableList'
import { SearchField } from '@components/SearchField/SearchField'

const CLEAR_ROW_ID = '__tax_code_clear__'

export type TaxCodeSelectOption = {
  label: string
  value: string
}

type TaxCodeSelectDrawerProps = {
  options: TaxCodeSelectOption[]
  selectedId?: string
  onSelect: (value: TaxCodeSelectOption | null) => void
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  isClearable?: boolean
}

export const TaxCodeSelectDrawer = ({
  options,
  selectedId,
  onSelect,
  isOpen,
  onOpenChange,
  isClearable = true,
}: TaxCodeSelectDrawerProps) => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const listOptions: ActionableListOption<TaxCodeSelectOption | null>[] = options.map(option => ({
    id: option.value,
    label: option.label,
    value: option,
  }))

  if (isClearable) {
    listOptions.unshift({
      id: CLEAR_ROW_ID,
      label: t('bankTransactions:action.clear_tax_code', 'Clear tax code'),
      value: null,
    })
  }

  const queryTrimmed = query.trim().toLowerCase()
  const filteredListOptions = queryTrimmed
    ? listOptions.filter(opt => opt.label.toLowerCase().includes(queryTrimmed))
    : listOptions

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
              if (item.id === CLEAR_ROW_ID) {
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
