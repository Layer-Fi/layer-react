import React, { useState } from 'react'
import { TooltipOptions } from './Tooltip'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react'

export type ContextType = ReturnType<typeof useTooltip> | null

export const TooltipContext = React.createContext<ContextType>(null)

export const useTooltipContext = () => {
  const context = React.useContext(TooltipContext)

  if (context == null) {
    throw new Error('Tooltip components must be wrapped in <Tooltip />')
  }

  return context
}

export const useTooltip = ({
  initialOpen = false,
  placement = 'top',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  disabled,
  offset: offsetProp = 5,
  shift: shiftProp = { padding: 5 },
}: TooltipOptions = {}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen)

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = setControlledOpen ?? setUncontrolledOpen

  const data = useFloating({
    placement,
    open: disabled ? false : open,
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

  return React.useMemo(
    () => ({
      open,
      setOpen,
      isMounted,
      styles,
      disabled,
      ...interactions,
      ...data,
    }),
    [open, setOpen, interactions, data, styles, disabled],
  )
}
