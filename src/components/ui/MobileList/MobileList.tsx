import { type PropsWithChildren, useCallback } from 'react'
import { composeRenderProps, GridList, GridListItem, type Selection } from 'react-aria-components'

import { Checkbox } from '@ui/Checkbox/Checkbox'
import { MobileListSkeleton } from '@ui/MobileList/MobileListSkeleton'

import './mobileList.scss'

type MobileListItemProps<TData> = PropsWithChildren<{
  item: TData
  onClickItem?: (item: TData) => void
}>

const MobileListItem = <TData extends { id: string }>({
  item,
  onClickItem,
  children,
}: MobileListItemProps<TData>) => {
  const onAction = useCallback(() => {
    onClickItem?.(item)
  }, [item, onClickItem])

  return (
    <GridListItem
      key={item.id}
      id={item.id}
      onAction={onAction}
      className='Layer__MobileList__Item'
    >
      {composeRenderProps(children, (children, { selectionMode, selectionBehavior }) => (
        <>
          {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
            <Checkbox slot='selection' size='md' />
          )}
          {children}
        </>
      ))}
    </GridListItem>
  )
}

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
