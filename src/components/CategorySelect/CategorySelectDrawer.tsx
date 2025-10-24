import { BusinessCategories } from '../BankTransactionMobileList/BusinessCategories'
import { Drawer } from '../ui/Modal/Modal'
import type { BankTransactionCategoryComboBoxOption } from '../../types/categorizationOption'

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
  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange} variant='mobile-drawer' isDismissable>
      {({ close }) => (
        <BusinessCategories
          select={(option) => {
            onSelect(option)
            close()
          }}
          selectedId={selectedId}
          showTooltips={showTooltips}
        />
      )}
    </Drawer>
  )
}
