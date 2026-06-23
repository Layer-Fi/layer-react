import { GridListHeader, GridListSection } from 'react-aria-components/GridList'

import { MobileListItem } from '@ui/MobileList/MobileListItem'
import { Span } from '@ui/Typography/Text'

import './mobileListSection.scss'

type MobileListSectionProps<TData extends { id: string }> = {
  label: string
  items: ReadonlyArray<TData>
  renderItem: (item: TData, state: { isExpanded: boolean }) => React.ReactNode
  renderFooter?: (item: TData) => React.ReactNode
  onClickItem?: (item: TData) => void
}

export const MobileListSection = <TData extends { id: string }>({
  label,
  items,
  renderItem,
  renderFooter,
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
      >
        {renderItem(item, { isExpanded: false })}
      </MobileListItem>
    ))}
  </GridListSection>
)
