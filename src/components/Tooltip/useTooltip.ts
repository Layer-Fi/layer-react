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
  isOpen: controlledOpen,
  onOpenChange: setControlledOpen,
  isDisabled,
  offset: offsetProp = 5,
  shift: shiftProp = { padding: 5 },
}: TooltipOptions = {}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(isInitiallyOpen)

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = setControlledOpen ?? setUncontrolledOpen

  const data = useFloating({
    placement,
    open: isDisabled ? false : open,
    onOpenChange: setOpen,
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
    enabled: controlledOpen == null,
  })
  const focus = useFocus(context, {
    enabled: controlledOpen == null,
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
      open,
      setOpen,
      isMounted,
      styles,
      isDisabled,
      ...interactions,
      ...data,
    }),
    [open, setOpen, isMounted, styles, isDisabled, interactions, data],
  )
}
