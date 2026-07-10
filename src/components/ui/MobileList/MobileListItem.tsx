import { type PropsWithChildren, type ReactNode, useCallback } from 'react'
import classNames from 'classnames'
import { composeRenderProps } from 'react-aria-components/composeRenderProps'
import { GridListItem } from 'react-aria-components/GridList'

import { AnimatedElement } from '@ui/AnimatedElement/AnimatedElement'
import { AnimatedPresenceElement } from '@ui/AnimatedPresenceElement/AnimatedPresenceElement'
import { Checkbox } from '@ui/Checkbox/Checkbox'

import './mobileListItem.scss'

type MobileListItemProps<TData> = PropsWithChildren<{
  item: TData
  onClickItem?: (item: TData) => void
  renderFooter?: (item: TData) => ReactNode
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
          isPresent={!isExiting}
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
            <AnimatedElement
              variant='expand'
              isVisible={isExpanded}
              className='Layer__MobileListItem__Expanded'
              // Prevent clicking on expansion from closing the row
              onClick={event => event.stopPropagation()}
            >
              {renderExpandedContent(item)}
            </AnimatedElement>
          )}
          {renderFooter && (
            <AnimatedPresenceElement
              variant='expand'
              isPresent={!isExpanded}
              motionKey={`${item.id}--footer`}
              className='Layer__MobileListItem__Footer'
            >
              {renderFooter(item)}
            </AnimatedPresenceElement>
          )}
        </AnimatedPresenceElement>
      ))}
    </GridListItem>
  )
}
