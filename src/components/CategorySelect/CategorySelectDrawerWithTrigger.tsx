import ChevronDown from '../../icons/ChevronDown'
import classNames from 'classnames'
import { CategorySelectDrawer } from './CategorySelectDrawer'
import { useState } from 'react'
import type { BankTransactionCategoryComboBoxOption } from '../../types/categorizationOption'

type Props = {
  value: BankTransactionCategoryComboBoxOption | null
  onChange: (newValue: BankTransactionCategoryComboBoxOption | null) => void
  disabled?: boolean
  showTooltips: boolean
}

export const CategorySelectDrawerWithTrigger = ({
  value,
  onChange,
  showTooltips,
}: Props) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <button
        aria-label='Select category'
        className={classNames(
          'Layer__category-menu__drawer-btn',
          value && 'Layer__category-menu__drawer-btn--selected',
        )}
        onClick={() => { setIsDrawerOpen(true) }}
      >
        {value?.label ?? 'Select...'}
        <ChevronDown
          size={16}
          className='Layer__category-menu__drawer-btn__arrow'
        />
      </button>
      <CategorySelectDrawer
        onSelect={onChange}
        selectedId={value?.value}
        showTooltips={showTooltips}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  )
}
