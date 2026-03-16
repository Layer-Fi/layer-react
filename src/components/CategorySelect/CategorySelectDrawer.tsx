import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCategories } from '@hooks/api/businesses/[business-id]/categories/useCategories'
import ChevronLeft from '@icons/ChevronLeft'
import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { ActionableList } from '@components/ActionableList/ActionableList'
import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { buildFilteredCategoryOptions, type CategoryGroup, type CategoryOption, flattenCategories, isGroup } from '@components/CategorySelect/utils'
import { SearchField } from '@components/SearchField/SearchField'

interface CategorySelectDrawerProps {
  onSelect: (value: BankTransactionCategoryComboBoxOption | null) => void
  selectedId?: string
  showTooltips: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CategorySelectDrawer = ({
  onSelect,
  selectedId,
  showTooltips,
  isOpen,
  onOpenChange,
}: CategorySelectDrawerProps) => {
  const { t } = useTranslation()
  const { data: categories } = useCategories()
  const [query, setQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup | null>(null)

  const clearSelectedGroup = useCallback(() => {
    setSelectedGroup(null)
    setQuery('')
  }, [])

  const handleOpenChange = useCallback((nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      clearSelectedGroup()
    }
    onOpenChange(nextIsOpen)
  }, [clearSelectedGroup, onOpenChange])

  const categoryOptions = useMemo(() => {
    if (selectedGroup) return selectedGroup.categories
    return flattenCategories(
      (categories ?? []).filter(category => category.type != 'ExclusionNested'),
    )
  }, [categories, selectedGroup])

  const filteredOptions = useMemo(
    () => buildFilteredCategoryOptions(categoryOptions, query),
    [categoryOptions, query],
  )

  const Header = useCallback(({ close }: { close: () => void }) => (
    <ModalTitleWithClose
      heading={(
        selectedGroup
          ? (
            <HStack align='start'>
              <Button variant='text' onClick={clearSelectedGroup}>
                <ChevronLeft size={18} />
                <ModalHeading size='sm' weight='bold' align='center'>
                  {selectedGroup.label}
                </ModalHeading>
              </Button>
            </HStack>
          )
          : <ModalHeading size='sm' weight='bold'>{t('bankTransactions:selectCategory', 'Select category')}</ModalHeading>
      )}
      onClose={close}
      hideBottomPadding
    />
  ), [clearSelectedGroup, selectedGroup, t])

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
          <SearchField value={query} onChange={setQuery} label={t('bankTransactions:searchCategories', 'Search categories...')} />
          <ActionableList<CategoryOption>
            options={filteredOptions}
            onClick={(item: { value: CategoryOption }) => {
              if (isGroup(item.value)) {
                setSelectedGroup(item.value)
                setQuery('')
                return
              }
              onSelect(item.value)
              close()
            }}
            selectedId={selectedId}
            showDescriptions={showTooltips}
            className='Layer__bank-transaction-mobile-list-item__categories_list'
          />
        </VStack>
      )}
    </Drawer>
  )
}
