import {
  cloneElement,
  forwardRef,
  type HTMLProps,
  isValidElement,
  type ReactNode,
  type Ref,
} from 'react'
import type { Placement } from '@floating-ui/react'
import { FloatingPortal, useMergeRefs } from '@floating-ui/react'
import classNames from 'classnames'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { HStack } from '@ui/Stack/Stack'
import { TooltipContext, useTooltip, useTooltipContext } from '@components/Tooltip/useTooltip'

import './tooltip.scss'

export type TooltipCapableComponentProps = {
  withTooltip?: boolean
}

export interface TooltipOptions {
  isInitiallyOpen?: boolean
  placement?: Placement
  isOpen?: boolean
  isDisabled?: boolean
  onOpenChange?: (open: boolean) => void
  offset?: number
  shift?: { padding?: number }
  wordBreak?: 'break-all'
}

export const Tooltip = ({
  children,
  ...options
}: { children: ReactNode } & TooltipOptions) => {
  const tooltip = useTooltip(options)
  return (
    <TooltipContext.Provider value={tooltip}>
      {children}
    </TooltipContext.Provider>
  )
}

export type TooltipTriggerVariant = 'fit-content' | 'truncate'
export type TooltipTriggerProps = { children: ReactNode } & { asChild?: boolean, wordBreak?: 'break-all', className?: string, variant?: TooltipTriggerVariant }
export const TooltipTrigger = forwardRef<
  HTMLElement,
  TooltipTriggerProps
>(function TooltipTrigger({ children, asChild = false, wordBreak, className, variant, ...props }, propRef) {
  const context = useTooltipContext()
  const childrenRef = (isValidElement(children) && 'ref' in children)
    ? children.ref as Ref<unknown>
    : null
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef])

  const dataProperties = toDataProperties({ variant })

  if (asChild && isValidElement(children)) {
    return cloneElement(
      children,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      context.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        'className': classNames(className, (children.props as { className?: string }).className),
        'data-state': context.isOpen ? 'open' : 'closed',
        'data-word-break': wordBreak,
      }),
    )
  }

  return (
    <HStack
      ref={ref}
      data-state={context.isOpen ? 'open' : 'closed'}
      className={classNames('Layer__UI__TooltipTrigger', className)}
      {...dataProperties}
      {...context.getReferenceProps(props)}
    >
      {children}
    </HStack>
  )
})

  type TooltipContentProps = Omit<HTMLProps<HTMLDivElement>, 'style' | 'className'> & { wordBreak?: 'break-all' }
export const TooltipContent = forwardRef<
  HTMLDivElement,
  TooltipContentProps
>(function TooltipContent({ wordBreak, ...props }, propRef) {
  const context = useTooltipContext()
  const ref = useMergeRefs([context.refs.setFloating, propRef])

  const dataProperties = toDataProperties({ 'word-break': wordBreak })

  if (!context.isOpen || context.isDisabled) return null

  return (
    <FloatingPortal>
      <div
        ref={ref}
        className='Layer__UI__Tooltip'
        style={{
          ...context.floatingStyles,
        }}
        {...dataProperties}
        {...context.getFloatingProps(props)}
      >
        <div className='Layer__UI__TooltipContent' style={{ ...context.styles }}>
          <span className='Layer__UI__TooltipContent__Text'>{props.children}</span>
        </div>
      </div>
    </FloatingPortal>
  )
})
