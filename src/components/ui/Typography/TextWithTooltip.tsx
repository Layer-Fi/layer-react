import { forwardRef, useRef } from 'react'
import type { ElementRef, PropsWithChildren } from 'react'
import { useTruncationDetection } from '../../../hooks/useTruncationDetection'
import { Tooltip, TooltipTrigger, TooltipContent } from '../../Tooltip'
import { Header, Label, P, Span } from './Text'
import classNames from 'classnames'

export interface TooltipOptions {
  contentClassName?: string
  offset?: number
  shift?: { padding?: number }
  maxWidth?: 'md'
  wordBreak?: 'break-all'
}

export interface WithTooltipProps {
  tooltipOptions?: TooltipOptions
  tooltipBehavior?: 'whenTruncated' | 'always'
  checkFirstChild?: boolean
}

function withTextTooltip<
  TComponent extends typeof Header | typeof Label | typeof P | typeof Span,
>(TextComponent: TComponent) {
  return forwardRef<
    ElementRef<TComponent>,
    PropsWithChildren<React.ComponentPropsWithoutRef<TComponent> & WithTooltipProps>
  >(function TextWithTooltipWrapper(props, _ref) {
    const {
      children,
      tooltipOptions = {
        maxWidth: 'md',
        wordBreak: 'break-all',
      },
      tooltipBehavior = 'whenTruncated',
      checkFirstChild = true,
      ...textProps
    } = props

    const elementRef = useRef<HTMLElement>(null)
    const isTruncated = useTruncationDetection(elementRef, {
      checkFirstChild,
      dependencies: [children],
    })

    const shouldShowTooltip = tooltipBehavior === 'always' || isTruncated

    return (
      <Tooltip
        disabled={!shouldShowTooltip}
        offset={tooltipOptions?.offset}
        shift={tooltipOptions?.shift}
      >
        <TooltipTrigger wordBreak={tooltipOptions?.wordBreak}>
          {/* @ts-expect-error -- HOC pattern: Text component props are compatible */}
          <TextComponent {...textProps} ref={elementRef}>
            {children}
          </TextComponent>
        </TooltipTrigger>
        <TooltipContent className={classNames('Layer__tooltip', tooltipOptions?.contentClassName)} width={tooltipOptions?.maxWidth} wordBreak={tooltipOptions?.wordBreak}>
          {children}
        </TooltipContent>
      </Tooltip>
    )
  })
}

export const HeaderWithTooltip = withTextTooltip(Header)
export const LabelWithTooltip = withTextTooltip(Label)
export const PWithTooltip = withTextTooltip(P)
export const SpanWithTooltip = withTextTooltip(Span)
