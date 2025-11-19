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

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { TooltipContext, useTooltip, useTooltipContext } from '@components/Tooltip/useTooltip'

export interface TooltipOptions {
  initialOpen?: boolean
  placement?: Placement
  open?: boolean
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
  offset?: number
  shift?: { padding?: number }
}

export const DeprecatedTooltip = ({
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

export const DeprecatedTooltipTrigger = forwardRef<
  HTMLElement,
  HTMLProps<HTMLElement> & { asChild?: boolean }
>(function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
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

type TooltipContentProps = Omit<HTMLProps<HTMLDivElement>, 'style'> & { width?: 'md' }

export const DeprecatedTooltipContent = forwardRef<
  HTMLDivElement,
  TooltipContentProps
>(function TooltipContent({ className, width, ...props }, propRef) {
  const context = useTooltipContext()
  const ref = useMergeRefs([context.refs.setFloating, propRef])

  const dataProperties = toDataProperties({ width })

  if (!context.open || context.disabled) return null

  return (
    <FloatingPortal>
      <div
        ref={ref}
        className={className}
        style={{
          ...context.floatingStyles,
        }}
        {...dataProperties}
        {...context.getFloatingProps(props)}
      >
        <div className='Layer__tooltip-content' style={{ ...context.styles }}>
          {props.children}
        </div>
      </div>
    </FloatingPortal>
  )
})
