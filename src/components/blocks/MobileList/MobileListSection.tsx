import { GridListHeader, GridListSection } from 'react-aria-components/GridList'

import { MobileListItem } from '@ui/MobileList/MobileListItem'
import { type MobileListItemActionsMenuConfig } from '@ui/MobileList/MobileListItemActionsMenu'
import { Span } from '@ui/Typography/Text'

import './mobileListSection.scss'

type MobileListSectionProps<TData extends { id: string }> = {
  label: string
  items: ReadonlyArray<TData>
  renderItem: (item: TData) => React.ReactNode
  renderFooter?: (item: TData) => React.ReactNode
  slotProps?: {
    ActionsMenu?: MobileListItemActionsMenuConfig<TData>
  }
  onClickItem?: (item: TData) => void
}

export const MobileListSection = <TData extends { id: string }>({
  label,
  items,
  renderItem,
  renderFooter,
  slotProps,
  onClickItem,
}: MobileListSectionProps<TData>) => (
  <GridListSection
    id={`__section:${label}`}
    className='Layer__MobileListSection'
  >
    <GridListHeader className='Layer__MobileListSection__Heading'>
      <Span size='md' weight='bold'>{label}</Span>
    </GridListHeader>
    {items.map(item => (
      <MobileListItem
        key={item.id}
        item={item}
        onClickItem={onClickItem}
        renderFooter={renderFooter}
        slotProps={slotProps}
      >
        {renderItem(item)}
      </MobileListItem>
    ))}
  </GridListSection>
)
