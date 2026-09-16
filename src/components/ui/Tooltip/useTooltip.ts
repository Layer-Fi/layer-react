import { createContext, useContext, useMemo, useState } from 'react'
import type { Placement } from '@floating-ui/react'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react'

export interface TooltipOptions {
  isInitiallyOpen?: boolean
  placement?: Placement
  isOpen?: boolean
  isDisabled?: boolean
  onOpenChange?: (open: boolean) => void
  offset?: number
  shift?: { padding?: number }
}

export type ContextType = ReturnType<typeof useTooltip> | null

export const TooltipContext = createContext<ContextType>(null)

export const useTooltipContext = () => {
  const context = useContext(TooltipContext)

  if (context == null) {
    throw new Error('Tooltip components must be wrapped in <Tooltip />')
  }

  return context
}

export const useTooltip = ({
  isInitiallyOpen = false,
  placement = 'top',
  isOpen: isControlledOpen,
  onOpenChange: setIsControlledOpen,
  isDisabled,
  offset: offsetProp = 5,
  shift: shiftProp = { padding: 5 },
}: TooltipOptions = {}) => {
  const [isUncontrolledOpen, setIsUncontrolledOpen] = useState(isInitiallyOpen)

  const isOpen = isControlledOpen ?? isUncontrolledOpen
  const setIsOpen = setIsControlledOpen ?? setIsUncontrolledOpen

  const data = useFloating({
    placement,
    open: isDisabled ? false : isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetProp),
      flip({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'start',
        padding: shiftProp?.padding ?? 5,
      }),
      shift(shiftProp),
    ],
  })

  const context = data.context

  const hover = useHover(context, {
    move: false,
    enabled: isControlledOpen == null,
  })
  const focus = useFocus(context, {
    enabled: isControlledOpen == null,
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })

  const interactions = useInteractions([hover, focus, dismiss, role])

  const { isMounted, styles } = useTransitionStyles(context, {
    initial: {
      opacity: 0,
      transform: 'scale(0.7)',
      color: 'transparent',
    },
    duration: 300,
  })

  return useMemo(
    () => ({
      isOpen,
      setIsOpen,
      isMounted,
      styles,
      isDisabled,
      ...interactions,
      ...data,
    }),
    [isOpen, setIsOpen, isMounted, styles, isDisabled, interactions, data],
  )
}
