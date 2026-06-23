import { type PropsWithChildren, type ReactNode, useCallback } from 'react'
import { composeRenderProps } from 'react-aria-components/composeRenderProps'
import { GridListItem } from 'react-aria-components/GridList'

import { AnimatedPresenceElement } from '@ui/AnimatedPresenceElement/AnimatedPresenceElement'
import { Checkbox } from '@ui/Checkbox/Checkbox'

import './mobileListItem.scss'

type MobileListItemProps<TData> = PropsWithChildren<{
  item: TData
  onClickItem?: (item: TData) => void
  renderFooter?: (item: TData, state: { isExpanded: boolean }) => ReactNode
  renderExpandedContent?: (item: TData) => ReactNode
  isExpanded?: boolean
}>

export const MobileListItem = <TData extends { id: string }>({
  item,
  onClickItem,
  children,
  renderFooter,
  renderExpandedContent,
  isExpanded = false,
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
          <div className='Layer__MobileListItem__Content'>
            {children}
          </div>
          {renderExpandedContent && (
            <AnimatedPresenceElement
              variant='expand'
              isOpen={isExpanded}
              motionKey={`${item.id}--expanded`}
              className='Layer__MobileListItem__Expanded'
            >
              {renderExpandedContent(item)}
            </AnimatedPresenceElement>
          )}
          {renderFooter && (
            <div className='Layer__MobileListItem__Footer'>
              {renderFooter(item, { isExpanded })}
            </div>
          )}
        </>
      ))}
    </GridListItem>
  )
}
