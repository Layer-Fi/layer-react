import { type PropsWithChildren, useCallback } from 'react'
import { composeRenderProps, GridListItem } from 'react-aria-components'

import { Checkbox } from '@ui/Checkbox/Checkbox'

import './mobileListItem.scss'

type MobileListItemProps<TData> = PropsWithChildren<{
  item: TData
  onClickItem?: (item: TData) => void
}>

export const MobileListItem = <TData extends { id: string }>({
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
      className='Layer__MobileListItem'
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
