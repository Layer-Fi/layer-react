import React, {
  ReactNode,
  forwardRef,
  HTMLProps,
  isValidElement,
  cloneElement,
} from 'react'
import { TooltipContext, useTooltip, useTooltipContext } from './useTooltip'
import { useMergeRefs, FloatingPortal } from '@floating-ui/react'
import type { Placement } from '@floating-ui/react'

export interface TooltipOptions {
  initialOpen?: boolean
  placement?: Placement
  open?: boolean
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
  offset?: number
  shift?: { padding?: number }
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

export const TooltipTrigger = forwardRef<
  HTMLElement,
  HTMLProps<HTMLElement> & { asChild?: boolean }
>(function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
  const context = useTooltipContext()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const childrenRef = (children as any).ref
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef])

  if (asChild && isValidElement(children)) {
    return cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        'data-state': context.open ? 'open' : 'closed',
      }),
    )
  }

  return (
    <span
      ref={ref}
      data-state={context.open ? 'open' : 'closed'}
      className={`Layer__tooltip-trigger Layer__tooltip-trigger--${
        context.open ? 'open' : 'closed'
      }`}
      {...context.getReferenceProps(props)}
    >
      {children}
    </span>
  )
})

type TooltipContentProps = Omit<HTMLProps<HTMLDivElement>, 'style'>

export const TooltipContent = forwardRef<
  HTMLDivElement,
  TooltipContentProps
>(function TooltipContent({ className, ...props }, propRef) {
  const context = useTooltipContext()
  const ref = useMergeRefs([context.refs.setFloating, propRef])

  if (!context.open || context.disabled) return null

  return (
    <FloatingPortal>
      <div
        ref={ref}
        className={className}
        style={{
          ...context.floatingStyles,
        }}
        {...context.getFloatingProps(props)}
      >
        <div className='Layer__tooltip-content' style={{ ...context.styles }}>
          {props.children}
        </div>
      </div>
    </FloatingPortal>
  )
})
