import { type PropsWithChildren, type ReactNode, useCallback } from 'react'
import classNames from 'classnames'
import { composeRenderProps } from 'react-aria-components/composeRenderProps'
import { GridListItem } from 'react-aria-components/GridList'

import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { AnimatedElement } from '@components/utility/AnimatedElement/AnimatedElement'
import { AnimatedPresenceElement } from '@components/utility/AnimatedPresenceElement/AnimatedPresenceElement'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { MobileListItemActionsMenu, type MobileListItemActionsMenuConfig } from '@blocks/MobileList/MobileListItemActionsMenu'

import './mobileListItem.scss'

const legacyClassNames = createLegacyClassNames({
  'state:selectable': 'Layer__MobileListItem--selectable',
  'state:withActions': 'Layer__MobileListItem--withActions',
} satisfies LegacyClassNameMapFor<'Layer__MobileListItem', `state:${string}`>)

type MobileListItemProps<TData> = PropsWithChildren<{
  item: TData
  onClickItem?: (item: TData) => void
  renderFooter?: (item: TData) => ReactNode
  renderExpandedContent?: (item: TData) => ReactNode
  slotProps?: {
    ActionsMenu?: MobileListItemActionsMenuConfig<TData>
  }
  isExpanded?: boolean
  isExiting?: boolean
  className?: string
  onExitComplete?: (item: TData) => void
}>

export const MobileListItem = <TData extends { id: string }>({
  item,
  onClickItem,
  children,
  renderFooter,
  renderExpandedContent,
  slotProps = {},
  isExpanded = false,
  isExiting = false,
  onExitComplete,
  className,
}: MobileListItemProps<TData>) => {
  const { ActionsMenu: actionsMenu } = slotProps
  const onAction = useCallback(() => {
    onClickItem?.(item)
  }, [item, onClickItem])

  const handleExitComplete = useCallback(() => {
    onExitComplete?.(item)
  }, [onExitComplete, item])

  return (
    <GridListItem
      key={item.id}
      id={item.id}
      className='Layer__MobileListRow'
      onAction={actionsMenu ? undefined : onAction}
    >
      {composeRenderProps(children, (children, { selectionMode, selectionBehavior }) => (
        <AnimatedPresenceElement
          variant='fade'
          isPresent={!isExiting}
          motionKey={item.id}
          className={classNames(
            'Layer__MobileListItem',
            legacyClassNames(
              selectionMode !== 'none' && 'state:selectable',
              actionsMenu && 'state:withActions',
            ),
            className,
          )}
          {...toDataProperties({
            'selectable': selectionMode !== 'none',
            'with-actions': Boolean(actionsMenu),
          })}
          slotProps={{ AnimatePresence: { initial: false, onExitComplete: handleExitComplete } }}
        >
          {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
            <Checkbox slot='selection' size='md' />
          )}
          <div className='Layer__MobileListItem__Content'>
            {children}
          </div>
          {actionsMenu && (
            <HStack className='Layer__MobileListItem__Action'>
              <MobileListItemActionsMenu
                ariaLabel={actionsMenu.ariaLabel}
                actions={actionsMenu.getActions(item)}
              />
            </HStack>
          )}
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
