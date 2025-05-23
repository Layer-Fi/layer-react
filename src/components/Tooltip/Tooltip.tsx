import {
  ReactNode,
  forwardRef,
  HTMLProps,
  isValidElement,
  cloneElement,
  type Ref,
  HTMLAttributes,
  RefObject,
} from 'react'
import { TooltipContext, useTooltip, useTooltipContext } from './useTooltip'
import { useMergeRefs, FloatingPortal } from '@floating-ui/react'
import type { OffsetOptions, Placement } from '@floating-ui/react'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'
import classNames from 'classnames'

export interface TooltipOptions {
  initialOpen?: boolean
  placement?: Placement
  open?: boolean
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
  offset?: OffsetOptions
  shift?: { padding?: number }
  slot?: string
  refHoriztontalAlignment?: {
    refElement: RefObject<HTMLElement> | null
    alignmentEdge?: 'start' | 'end'
  }
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
>(function TooltipTrigger({ children, asChild = false, slot, ...props }, propRef) {
  const context = useTooltipContext()
  const childrenRef = (isValidElement(children) && 'ref' in children)
    ? children.ref as Ref<unknown>
    : null
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef])

  if (asChild && isValidElement(children)) {
    return cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...(children.props as HTMLProps<HTMLElement>),
        'data-state': context.open ? 'open' : 'closed',
      } as HTMLAttributes<HTMLElement>),
    )
  }

  return (
    <span
      ref={ref}
      data-state={context.open ? 'open' : 'closed'}
      className={`Layer__tooltip-trigger Layer__tooltip-trigger--${
        context.open ? 'open' : 'closed'
      }`}
      slot={slot}
      {...context.getReferenceProps(props)}
    >
      {children}
    </span>
  )
})

type TooltipContentProps = Omit<HTMLProps<HTMLDivElement>, 'style'> & { width?: 'md' | 'lg' }

export const TooltipContent = forwardRef<
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
        className={classNames('Layer__tooltip', className)}
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
