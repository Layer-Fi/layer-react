import { useContext } from 'react'
import { DrawerContext } from '../../contexts/DrawerContext'
import ChevronDown from '../../icons/ChevronDown'
import { BusinessCategories } from '../BankTransactionMobileList/BusinessCategories'
import { CategoryOption, CategoryOptionPayload, OptionActionType } from './types'
import classNames from 'classnames'

interface CategorySelectDrawerProps {
  onSelect: (value: CategoryOption) => void
  selected?: CategoryOption
  showTooltips: boolean
}

export const CategorySelectDrawer = ({
  onSelect,
  selected,
  showTooltips: _showTooltips,
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
            showTooltips
          />,
        )}
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
  showTooltips,
}: {
  onSelect: (value: CategoryOption) => void
  selected?: CategoryOption
  showTooltips: boolean
}) => (
  <BusinessCategories
    select={(option) => {
      if (option.value.payload) {
        onSelect({
          type: OptionActionType.CATEGORY,
          payload: {
            ...option.value.payload,
          } as CategoryOptionPayload,
        } satisfies CategoryOption)
      }
    }}
    selectedId={selected?.payload?.id}
    showTooltips={showTooltips}
  />
)
