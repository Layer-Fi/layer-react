import { type PropsWithChildren, type ReactNode, useCallback } from 'react'
import classNames from 'classnames'
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
  isExiting?: boolean
  onExitComplete?: (item: TData) => void
}>

export const MobileListItem = <TData extends { id: string }>({
  item,
  onClickItem,
  children,
  renderFooter,
  renderExpandedContent,
  isExpanded = false,
  isExiting = false,
  onExitComplete,
}: MobileListItemProps<TData>) => {
  const onAction = useCallback(() => {
    onClickItem?.(item)
  }, [item, onClickItem])

  const handleExitComplete = useCallback(() => {
    onExitComplete?.(item)
  }, [onExitComplete, item])

  return (
    <GridListItem key={item.id} id={item.id} onAction={onAction}>
      {composeRenderProps(children, (children, { selectionMode, selectionBehavior }) => (
        <AnimatedPresenceElement
          variant='fade'
          isOpen={!isExiting}
          motionKey={item.id}
          className={classNames(
            'Layer__MobileListItem',
            selectionMode !== 'none' && 'Layer__MobileListItem--selectable',
          )}
          slotProps={{ AnimatePresence: { initial: false, onExitComplete: handleExitComplete } }}
        >
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
            <AnimatedPresenceElement
              variant='expand'
              isOpen={!isExpanded}
              motionKey={`${item.id}--footer`}
              className='Layer__MobileListItem__Footer'
            >
              {renderFooter(item, { isExpanded })}
            </AnimatedPresenceElement>
          )}
        </AnimatedPresenceElement>
      ))}
    </GridListItem>
  )
}
