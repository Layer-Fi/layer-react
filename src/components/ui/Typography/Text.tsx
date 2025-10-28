import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'
import {
  Header as ReactAriaHeader,
  Label as ReactAriaLabel,
  Text as ReactAriaText,
} from 'react-aria-components'
import './text.scss'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipCapable } from '../../Tooltip'
import classNames from 'classnames'

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

/**
 * Header represents a header within a Spectrum container.
 *
 * See: https://react-spectrum.adobe.com/react-spectrum/Header.html#header
 */
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
const SPAN_TOOLTIP_CLASS_NAME = 'Layer__Span--with-tooltip'
type SpanProps = Pick<ComponentPropsWithoutRef<'span'>, 'id' | 'slot'> & TextRenderingProps

export const Span = forwardRef<HTMLSpanElement, PropsWithChildren<SpanProps & TextStyleProps & TooltipCapable>>(
  function Span(props, ref) {
    const { children, dataProperties, renderingProps, restProps } = splitTextProps(props)
    const { tooltipContentWidth = 'md' } = props

    if (props.withTooltip) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <span {...restProps} {...dataProperties} className={SPAN_CLASS_NAME} ref={ref}>{children}</span>
          </TooltipTrigger>
          <TooltipContent width={tooltipContentWidth}>
            <span {...restProps} {...dataProperties} className={classNames(SPAN_CLASS_NAME, SPAN_TOOLTIP_CLASS_NAME)}>{children}</span>
          </TooltipContent>
        </Tooltip>
      )
    }

    if (renderingProps.nonAria) {
      return (
        <span {...restProps} {...dataProperties} className={SPAN_CLASS_NAME} ref={ref}>
          {children}
        </span>
      )
    }

    return (
      <ReactAriaText {...restProps} {...dataProperties} className={SPAN_CLASS_NAME} ref={ref}>
        {children}
      </ReactAriaText>
    )
  },
)
