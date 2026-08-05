import { useCallback, useMemo, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { BankTransactionNonSuggestedMatchOption } from '@internal-types/features/categorization/bankTransactionMatchOption'
import type { CategoriesListMode } from '@schemas/features/categorization/categoryList'
import { withoutExclusions } from '@utils/features/categorization/categoryOptions'
import { useGetCategories } from '@api/businesses/[business-id]/categories/get'
import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { SearchField } from '@ui/SearchField/SearchField'
import { HStack, VStack } from '@ui/Stack/Stack'
import { ActionableList } from '@blocks/ActionableList/ActionableList'
import {
  buildFilteredCategoryOptions,
  type CategoryGroup,
  type CategoryOption,
  flattenCategories,
  getSelectedCategoryActionableId,
  isGroup,
} from '@features/categorization/CategorySelectDrawer/utils'

import './categorySelectDrawer.scss'

interface CategorySelectDrawerProps {
  onSelectedValueChange: (value: BankTransactionNonSuggestedMatchOption | null) => void
  selectedValue: BankTransactionNonSuggestedMatchOption | null
  showTooltips: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  hideExclusions?: boolean
  mode?: CategoriesListMode
}

export const CategorySelectDrawer = ({
  onSelectedValueChange,
  selectedValue,
  showTooltips,
  isOpen,
  onOpenChange,
  hideExclusions,
  mode,
}: CategorySelectDrawerProps) => {
  const { t } = useTranslation()
  const { data: categories } = useGetCategories({ mode })
  const [query, setQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup | null>(null)
  const selectedId = selectedValue?.value
  const selectedActionableId = getSelectedCategoryActionableId(selectedValue)

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
    const allCategories = categories ?? []
    return flattenCategories(hideExclusions ? withoutExclusions(allCategories) : allCategories)
  }, [categories, selectedGroup, hideExclusions])

  const filteredOptions = useMemo(
    () => buildFilteredCategoryOptions(categoryOptions, query, selectedId),
    [categoryOptions, query, selectedId],
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
          : <ModalHeading size='sm' weight='bold'>{t('categorization:CategorySelectDrawer.action.select_category', 'Select category')}</ModalHeading>
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
        <VStack className='Layer__CategorySelectDrawer__ListContainer' pb='md' gap='md'>
          <SearchField value={query} onChange={setQuery} label={t('categorization:CategorySelectDrawer.action.search_categories', 'Search categories...')} />
          <ActionableList<CategoryOption>
            options={filteredOptions}
            onClick={(item: { value: CategoryOption }) => {
              if (isGroup(item.value)) {
                setSelectedGroup(item.value)
                setQuery('')
                return
              }
              onSelectedValueChange(item.value)
              close()
            }}
            selectedId={selectedActionableId}
            showDescriptions={showTooltips}
            className='Layer__CategorySelectDrawer__List'
          />
        </VStack>
      )}
    </Drawer>
  )
}
