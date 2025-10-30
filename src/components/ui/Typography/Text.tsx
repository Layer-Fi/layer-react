import { forwardRef, useRef } from 'react'
import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'
import {
  Header as ReactAriaHeader,
  Label as ReactAriaLabel,
  Text as ReactAriaText,
} from 'react-aria-components'
import './text.scss'

import classNames from 'classnames'
import { useTruncationDetection } from '../../../hooks/useTruncationDetection/useTruncationDetection'
import { mergeRefs } from 'react-merge-refs'
import { TooltipCapableComponentProps, TooltipContent, TooltipTrigger, Tooltip } from '../Tooltip/Tooltip'
import React from 'react'

export type TextStyleProps = {
  align?: 'center' | 'right'
  ellipsis?: true
  noWrap?: true
  pb?: Spacing
  pbe?: Spacing
  pbs?: Spacing
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'error'
  variant?: 'placeholder' | 'subtle' | 'inherit'
  weight?: 'normal' | 'bold'
  className?: string
}

type TextRenderingProps = {
  nonAria?: true
}

function splitTextProps<TRest>(props: PropsWithChildren<TextStyleProps & TextRenderingProps & TRest>) {
  const {
    align,
    children,
    ellipsis,
    nonAria,
    noWrap,
    pb,
    pbe,
    pbs,
    size,
    status,
    variant,
    weight,
    ...restProps
  } = props

  return {
    children,
    dataProperties: toDataProperties({
      align,
      ellipsis,
      'no-wrap': noWrap,
      pb,
      pbe,
      pbs,
      size,
      status,
      variant,
      weight,
    }),
    renderingProps: { nonAria },
    restProps,
  }
}

const HEADER_CLASS_NAME = 'Layer__Header'
type HeaderProps = Pick<ComponentPropsWithoutRef<'header'>, 'id' | 'slot'> & TextRenderingProps

export const Header = forwardRef<HTMLElementTagNameMap['header'], PropsWithChildren<HeaderProps & TextStyleProps>>(
  function Header(props, ref) {
    const { children, dataProperties, renderingProps, restProps } = splitTextProps(props)

    const HeaderComponent = renderingProps.nonAria
      ? 'header'
      : ReactAriaHeader

    return (
      <HeaderComponent {...restProps} {...dataProperties} className={HEADER_CLASS_NAME} ref={ref}>
        {children}
      </HeaderComponent>
    )
  },
)

const LABEL_CLASS_NAME = 'Layer__Label'
type LabelProps = Pick<ComponentPropsWithoutRef<'label'>, 'id' | 'slot' | 'htmlFor'> & TextRenderingProps

export const Label = forwardRef<HTMLLabelElement, PropsWithChildren<LabelProps & TextStyleProps>>(
  function Label(props, ref) {
    const { children, dataProperties, renderingProps, restProps } = splitTextProps(props)

    const LabelComponent = renderingProps.nonAria
      ? 'label'
      : ReactAriaLabel

    return (
      <LabelComponent {...restProps} {...dataProperties} className={LABEL_CLASS_NAME} ref={ref}>
        {children}
      </LabelComponent>
    )
  },
)

const P_CLASS_NAME = 'Layer__P'
type ParagraphProps = Pick<ComponentPropsWithoutRef<'p'>, 'id' | 'slot'> & TextRenderingProps

export const P = forwardRef<HTMLParagraphElement, PropsWithChildren<ParagraphProps & TextStyleProps>>(
  function P(props, ref) {
    const { children, dataProperties, renderingProps, restProps } = splitTextProps(props)

    if (renderingProps.nonAria) {
      return (
        <p {...restProps} {...dataProperties} className={P_CLASS_NAME} ref={ref}>
          {children}
        </p>
      )
    }

    return (
      <ReactAriaText elementType='p' {...restProps} {...dataProperties} className={P_CLASS_NAME} ref={ref}>
        {children}
      </ReactAriaText>
    )
  },
)

const SPAN_CLASS_NAME = 'Layer__Span'
type SpanProps = Pick<ComponentPropsWithoutRef<'span'>, 'id' | 'slot'> & TextRenderingProps

type BaseSpanProps = {
  dataProperties: Record<string, unknown>
  restProps: Record<string, unknown>
  hasRef: boolean
  className?: string
  renderingProps: TextRenderingProps
  children: React.ReactNode
}

const BaseSpan = forwardRef<HTMLSpanElement, BaseSpanProps>(({ dataProperties, restProps, hasRef, className, renderingProps, children }, ref) => {
  if (renderingProps.nonAria) {
    return (
      <span {...restProps} {...dataProperties} className={classNames(SPAN_CLASS_NAME, className)} ref={hasRef ? ref : undefined}>
        {children}
      </span>
    )
  }

  return (
    <ReactAriaText {...restProps} {...dataProperties} className={classNames(SPAN_CLASS_NAME, className)} ref={hasRef ? ref : undefined}>
      {children}
    </ReactAriaText>
  )
})
BaseSpan.displayName = 'BaseSpan'

export const Span = forwardRef<HTMLSpanElement, PropsWithChildren<SpanProps & TextStyleProps & TooltipCapableComponentProps>>(
  function Span(props, forwardedRef) {
    const { children, dataProperties, renderingProps, restProps } = splitTextProps(props)
    const { className, tooltipContentWidth = 'md' } = props

    const internalRef = useRef<HTMLSpanElement | null>(null)
    const isTruncated = useTruncationDetection(internalRef, { checkFirstChild: true })

    const mergedRef = mergeRefs([internalRef, forwardedRef])

    if (props.withTooltip) {
      const dataPropertiesWithEllipsis = { ...dataProperties, 'data-with-tooltip': true }
      return (
        <Tooltip disabled={!isTruncated}>
          <TooltipTrigger>
            <BaseSpan
              dataProperties={dataPropertiesWithEllipsis}
              restProps={restProps}
              hasRef={true}
              className={className}
              renderingProps={renderingProps}
              ref={mergedRef}
            >
              {children}
            </BaseSpan>
          </TooltipTrigger>
          <TooltipContent width={tooltipContentWidth}>
            <BaseSpan
              dataProperties={dataProperties}
              restProps={restProps}
              hasRef={false}
              className='Layer__UI__tooltip-content--text'
              renderingProps={renderingProps}
            >
              {children}
            </BaseSpan>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
)
