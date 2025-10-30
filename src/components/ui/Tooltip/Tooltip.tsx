import {
  ReactNode,
  forwardRef,
  HTMLProps,
  isValidElement,
  cloneElement,
  type Ref,
} from 'react'
import { TooltipContext, useTooltip, useTooltipContext } from '../../Tooltip/useTooltip'
import { useMergeRefs, FloatingPortal } from '@floating-ui/react'
import type { Placement } from '@floating-ui/react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import classNames from 'classnames'
import { HStack } from '../../ui/Stack/Stack'

export type TooltipCapableComponentProps = {
  withTooltip?: boolean
  tooltipContentWidth?: 'sm' | 'md'
}

export interface TooltipOptions {
  initialOpen?: boolean
  placement?: Placement
  open?: boolean
  disabled?: boolean
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

export type TooltipTriggerProps = { children: ReactNode } & { asChild?: boolean, wordBreak?: 'break-all' }
export const TooltipTrigger = forwardRef<
  HTMLElement,
  TooltipTriggerProps
>(function TooltipTrigger({ children, asChild = false, wordBreak, ...props }, propRef) {
  const context = useTooltipContext()
  const childrenRef = (isValidElement(children) && 'ref' in children)
    ? children.ref as Ref<unknown>
    : null
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef])

  if (asChild && isValidElement(children)) {
    return cloneElement(
      children,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      context.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        'data-state': context.open ? 'open' : 'closed',
        'data-word-break': wordBreak,
      }),
    )
  }

  return (
    <HStack
      ref={ref}
      data-state={context.open ? 'open' : 'closed'}
      className={classNames('Layer__UI__input-tooltip', 'Layer__UI__tooltip-trigger', `Layer__UI__tooltip-trigger--${
        context.open ? 'open' : 'closed'
      }`)}
      {...context.getReferenceProps(props)}
    >
      {children}
    </HStack>
  )
})

  type TooltipContentProps = Omit<HTMLProps<HTMLDivElement>, 'style'> & { width?: 'sm' | 'md', wordBreak?: 'break-all' }
export const TooltipContent = forwardRef<
  HTMLDivElement,
  TooltipContentProps
>(function TooltipContent({ className, width, wordBreak, ...props }, propRef) {
  const context = useTooltipContext()
  const ref = useMergeRefs([context.refs.setFloating, propRef])

  const dataProperties = toDataProperties({ width, 'word-break': wordBreak })

  if (!context.open || context.disabled) return null

  return (
    <FloatingPortal>
      <div
        ref={ref}
        className={classNames('Layer__tooltip', 'Layer__UI__tooltip', className)}
        style={{
          ...context.floatingStyles,
        }}
        {...dataProperties}
        {...context.getFloatingProps(props)}
      >
        <div className='Layer__UI__tooltip-content' style={{ ...context.styles }}>
          {props.children}
        </div>
      </div>
    </FloatingPortal>
  )
})
