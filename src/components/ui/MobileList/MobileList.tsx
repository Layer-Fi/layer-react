import { useCallback } from 'react'
import { GridList, type Selection } from 'react-aria-components'

import { MobileListItem } from '@ui/MobileList/MobileListItem'
import { MobileListSection } from '@ui/MobileList/MobileListSection'
import { MobileListSkeleton } from '@ui/MobileList/MobileListSkeleton'

import './mobileList.scss'

const EMPTY_ARRAY: never[] = []

export type MobileListVariant = 'default' | 'compact'

export type MobileListGroup<TData> = {
  label: string
  items: ReadonlyArray<TData>
}

interface MobileListBaseProps<TData> {
  ariaLabel: string
  isLoading: boolean
  isError: boolean
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
  renderItem: (item: TData) => React.ReactNode
  onClickItem?: (item: TData) => void
  variant?: MobileListVariant
}

interface MobileListSelectionProps {
  enableSelection?: boolean
  selectionMode?: 'none' | 'single' | 'multiple'
  selectedKeys?: Set<string>
  onSelectionChange?: (keys: Selection) => void
}

const isSelectionEnabled = (props: MobileListSelectionProps) =>
  props.selectionMode !== 'none' && props.enableSelection

const isGrouped = <T,>(
  data: MobileListData<T> | undefined,
): data is MobileListGroupedData<T> => !!data && !Array.isArray(data)

export type MobileListGroupedData<TData> = {
  groups: ReadonlyArray<MobileListGroup<TData>>
}

export type MobileListData<TData> =
  | ReadonlyArray<TData>
  | MobileListGroupedData<TData>

export type MobileListProps<TData> =
  MobileListBaseProps<TData> & MobileListSelectionProps & {
    data: MobileListData<TData> | undefined
  }

export const MobileList = <TData extends { id: string }>({
  ariaLabel,
  data,
  slots,
  renderItem,
  onClickItem,
  isLoading,
  isError,
  variant = 'default',
  enableSelection = false,
  selectionMode = 'none',
  selectedKeys,
  onSelectionChange,
}: MobileListProps<TData>) => {
  const { EmptyState, ErrorState } = slots

  const resolvedSelectionMode =
    isSelectionEnabled({ enableSelection, selectionMode }) ? selectionMode : 'none'

  const resolvedSelectionBehavior = resolvedSelectionMode === 'none' ? 'toggle' : undefined

  const renderEmptyState = useCallback(() => {
    return <EmptyState />
  }, [EmptyState])

  if (isLoading) {
    return <MobileListSkeleton />
  }

  if (isError) {
    return <ErrorState />
  }

  const renderRow = (item: TData) => (
    <MobileListItem key={item.id} item={item} onClickItem={onClickItem}>
      {renderItem(item)}
    </MobileListItem>
  )

  return (
    <GridList
      aria-label={ariaLabel}
      className='Layer__MobileList'
      data-variant={variant}
      selectionMode={resolvedSelectionMode}
      selectionBehavior={resolvedSelectionBehavior}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
      renderEmptyState={renderEmptyState}
    >
      {isGrouped(data)
        ? data.groups.map(group => (
          <MobileListSection
            key={group.label}
            label={group.label}
            items={group.items}
            renderItem={renderItem}
            onClickItem={onClickItem}
          />
        ))
        : (data ?? EMPTY_ARRAY).map(renderRow)}
    </GridList>
  )
}
