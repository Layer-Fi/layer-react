import {
  cloneElement,
  forwardRef,
  type HTMLProps,
  isValidElement,
  type ReactNode,
  type Ref,
  useCallback,
} from 'react'
import type { Placement } from '@floating-ui/react'
import { FloatingPortal, useMergeRefs } from '@floating-ui/react'
import classNames from 'classnames'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { HStack } from '@ui/Stack/Stack'
import { TooltipContext, useTooltip, useTooltipContext } from '@ui/Tooltip/useTooltip'

import './tooltip.scss'

/* Two generations to keep alive: the unprefixed `Layer__tooltip*` set and the kebab set after it. */
const legacyClassNames = createLegacyClassNames({
  Layer__UI__Tooltip: ['Layer__UI__tooltip', 'Layer__tooltip'],
  Layer__UI__TooltipContent: ['Layer__UI__tooltip-content', 'Layer__tooltip-content'],
  Layer__UI__TooltipContent__Text: 'Layer__UI__tooltip-content--text',
  Layer__UI__TooltipTrigger: ['Layer__UI__tooltip-trigger', 'Layer__tooltip-trigger'],
})

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
  // Wrapped because floating-ui declares the setters as methods, which reads as an unbound `this`.
  const setReference = useCallback((node: HTMLElement | null) => context.refs.setReference(node), [context.refs])
  const ref = useMergeRefs([setReference, propRef, childrenRef])

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
      className={classNames(legacyClassNames('Layer__UI__TooltipTrigger'), className)}
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
  const setFloating = useCallback((node: HTMLElement | null) => context.refs.setFloating(node), [context.refs])
  const ref = useMergeRefs([setFloating, propRef])

  const dataProperties = toDataProperties({ 'word-break': wordBreak })

  if (!context.isOpen || context.isDisabled) return null

  return (
    <FloatingPortal>
      <div
        ref={ref}
        className={legacyClassNames('Layer__UI__Tooltip')}
        style={{
          ...context.floatingStyles,
        }}
        {...dataProperties}
        {...context.getFloatingProps(props)}
      >
        <div className={legacyClassNames('Layer__UI__TooltipContent')} style={{ ...context.styles }}>
          <span className={legacyClassNames('Layer__UI__TooltipContent__Text')}>{props.children}</span>
        </div>
      </div>
    </FloatingPortal>
  )
})
