import React, { useContext } from 'react'
import { DrawerContext } from '../../contexts/DrawerContext'
import ChevronDown from '../../icons/ChevronDown'
import { BusinessCategories } from '../BankTransactionMobileList/BusinessCategories'
import { Option } from '../BankTransactionMobileList/utils'
import { CategoryOption, OptionActionType } from './CategorySelect'
import classNames from 'classnames'

interface CategorySelectDrawerProps {
  onSelect: (value: CategoryOption) => void
  selected?: CategoryOption
}

export const CategorySelectDrawer = ({
  onSelect,
  selected,
}: CategorySelectDrawerProps) => {
  const { setContent, close } = useContext(DrawerContext)

  const onDrawerCategorySelect = (value: CategoryOption) => {
    close()
    onSelect(value)
  }

  return (
    <button
      aria-label='Select category'
      className={classNames(
        'Layer__category-menu__drawer-btn',
        selected && 'Layer__category-menu__drawer-btn--selected',
      )}
      onClick={() =>
        setContent(
          <CategorySelectDrawerContent
            selected={selected}
            onSelect={onDrawerCategorySelect}
          />,
        )
      }
    >
      {selected?.payload?.display_name ?? 'Select...'}
      <ChevronDown
        size={16}
        className='Layer__category-menu__drawer-btn__arrow'
      />
    </button>
  )
}

const CategorySelectDrawerContent = ({
  onSelect,
  selected,
}: {
  onSelect: (value: CategoryOption) => void
  selected?: CategoryOption
}) => (
  <BusinessCategories
    select={option => {
      option.value.payload &&
        onSelect({
          type: OptionActionType.CATEGORY,
          payload: {
            ...option.value.payload,
          },
        } satisfies CategoryOption)
    }}
    selectedId={selected?.payload?.id}
  />
)
