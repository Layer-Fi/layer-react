import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import ChevronLeft from '@icons/ChevronLeft'
import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack } from '@ui/Stack/Stack'
import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionsMobileListBusinessCategories } from '@components/BankTransactionsMobileList/BankTransactionsMobileListBusinessCategories'
import type { CategoryGroup } from '@components/BankTransactionsMobileList/utils'

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
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup | null>(null)

  const handleOpenChange = useCallback((nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      setSelectedGroup(null)
    }
    onOpenChange(nextIsOpen)
  }, [onOpenChange])

  const Header = useCallback(({ close }: { close: () => void }) => (
    <ModalTitleWithClose
      heading={(
        selectedGroup
          ? (
            <HStack align='start'>
              <Button variant='text' onClick={() => setSelectedGroup(null)}>
                <ChevronLeft size={18} />
                <ModalHeading size='sm' weight='bold' align='center'>
                  {selectedGroup.label}
                </ModalHeading>
              </Button>
            </HStack>
          )
          : <ModalHeading size='sm' weight='bold'>{t('selectCategory', 'Select category')}</ModalHeading>
      )}
      onClose={close}
      hideBottomPadding
    />
  ), [selectedGroup, t])

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
        <BankTransactionsMobileListBusinessCategories
          select={(option) => {
            onSelect(option)
            close()
          }}
          selectedId={selectedId}
          showTooltips={showTooltips}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />
      )}
    </Drawer>
  )
}
