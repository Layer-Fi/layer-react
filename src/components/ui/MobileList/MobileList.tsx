import { useCallback } from 'react'
import { GridList, type Selection } from 'react-aria-components/GridList'

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
  renderFooter?: (item: TData) => React.ReactNode
  renderExpandedContent?: (item: TData) => React.ReactNode
  expandedKeys?: Set<string>
  exitingKeys?: Set<string>
  onRemoveItem?: (item: TData) => void
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
  renderFooter,
  renderExpandedContent,
  expandedKeys,
  exitingKeys,
  onRemoveItem,
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

  const renderRow = useCallback((item: TData) => {
    return (
      <MobileListItem
        key={item.id}
        item={item}
        onClickItem={onClickItem}
        renderFooter={renderFooter}
        renderExpandedContent={renderExpandedContent}
        isExpanded={expandedKeys?.has(item.id) ?? false}
        isExiting={exitingKeys?.has(item.id) ?? false}
        onExitComplete={onRemoveItem}
      >
        {renderItem(item)}
      </MobileListItem>
    )
  }, [exitingKeys, expandedKeys, onClickItem, onRemoveItem, renderExpandedContent, renderFooter, renderItem])

  const renderEmptyState = useCallback(() => {
    return <EmptyState />
  }, [EmptyState])

  if (isLoading) {
    return <MobileListSkeleton variant={variant} />
  }

  if (isError) {
    return <ErrorState />
  }

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
            renderFooter={renderFooter}
            onClickItem={onClickItem}
          />
        ))
        : (data ?? EMPTY_ARRAY).map(renderRow)}
    </GridList>
  )
}
