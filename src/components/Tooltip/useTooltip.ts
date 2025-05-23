import { useMemo, useState, createContext, useContext } from 'react'
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
  MiddlewareState,
} from '@floating-ui/react'

export type ContextType = ReturnType<typeof useTooltip> | null

export const TooltipContext = createContext<ContextType>(null)

export const useTooltipContext = () => {
  const context = useContext(TooltipContext)

  if (context == null) {
    throw new Error('Tooltip components must be wrapped in <Tooltip />')
  }

  return context
}

function calculateOffset(state: MiddlewareState, refHoriztontalAlignment: TooltipOptions['refHoriztontalAlignment'], offsetProp: TooltipOptions['offset']) {
  if (refHoriztontalAlignment && refHoriztontalAlignment.refElement?.current) {
    const { x: refX, width: refWidth } = refHoriztontalAlignment.refElement.current.getBoundingClientRect()

    const crossShiftOffsetProps = typeof offsetProp === 'number' ? offsetProp : offsetProp && 'crossAxis' in offsetProp && offsetProp.crossAxis ? offsetProp.crossAxis : 0
    const restProps = typeof offsetProp === 'object' ? offsetProp : {}

    if (refHoriztontalAlignment.alignmentEdge === 'end' && state.rects.reference.x + state.rects.reference.width + state.rects.floating.width + crossShiftOffsetProps > refX + refWidth) {
      return {
        ...restProps,
        crossAxis: refX + refWidth - state.rects.reference.x - state.rects.reference.width - crossShiftOffsetProps,
      }
    }

    if (refHoriztontalAlignment.alignmentEdge !== 'end' && -(state.x - refX) + crossShiftOffsetProps > 0) {
      return {
        ...restProps,
        crossAxis: -(state.x - refX) + crossShiftOffsetProps,
      }
    }
  }

  if (typeof offsetProp === 'object') {
    return offsetProp
  }

  if (typeof offsetProp === 'number') {
    return { crossAxis: offsetProp }
  }

  return {}
}

export const useTooltip = ({
  initialOpen = false,
  placement = 'top',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  disabled,
  offset: offsetProp = 5,
  shift: shiftProp = { padding: 5 },
  refHoriztontalAlignment,
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
      offset(state => calculateOffset(state, refHoriztontalAlignment, offsetProp)),
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
      disabled,
      ...interactions,
      ...data,
    }),
    [open, setOpen, interactions, data, styles, disabled, isMounted],
  )
}
