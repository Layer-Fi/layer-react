import { GridList, type Selection } from 'react-aria-components'

import { MobileListItem } from '@ui/MobileList/MobileListItem'
import { MobileListSkeleton } from '@ui/MobileList/MobileListSkeleton'

import './mobileList.scss'

interface SelectionProps {
  enableSelection?: boolean
  selectionMode?: 'none' | 'single' | 'multiple'
  selectedKeys?: Set<string>
  onSelectionChange?: (keys: Selection) => void
}

interface MobileListBaseProps<TData> {
  ariaLabel: string
  isLoading: boolean
  isError: boolean
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
  data: ReadonlyArray<TData> | undefined
  renderItem: (item: TData) => React.ReactNode
  onClickItem?: (item: TData) => void
}

export type MobileListProps<TData> = MobileListBaseProps<TData> & SelectionProps

const isSelectionEnabled = (props: SelectionProps) => {
  return props.selectionMode !== 'none' && props.enableSelection
}

export const MobileList = <TData extends { id: string }>(props: MobileListProps<TData>) => {
  const {
    ariaLabel,
    data,
    slots,
    renderItem,
    onClickItem,
    isLoading,
    isError,
    selectionMode = 'none',
    ...restSelectionProps
  } = props
  const { EmptyState, ErrorState } = slots

  const resolvedSelectionMode = isSelectionEnabled(props) ? selectionMode : 'none'
  const resolvedSelectionBehavior = resolvedSelectionMode === 'none' ? 'toggle' : undefined

  if (isLoading) {
    return <MobileListSkeleton />
  }

  if (isError) {
    return <ErrorState />
  }

  return (
    <GridList
      items={data}
      selectionMode={resolvedSelectionMode}
      selectionBehavior={resolvedSelectionBehavior}
      renderEmptyState={EmptyState}
      aria-label={ariaLabel}
      className='Layer__MobileList'
      {...restSelectionProps}
    >
      {item => <MobileListItem onClickItem={onClickItem} item={item}>{renderItem(item)}</MobileListItem>}
    </GridList>
  )
}
