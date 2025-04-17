import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'
import { Text as ReactAriaText, Label as ReactAriaLabel } from 'react-aria-components'

const P_CLASS_NAME = 'Layer__P'

type ParagraphProps = Pick<ComponentPropsWithoutRef<'p'>, 'slot'>

type TextStyleProps = {
  align?: 'center'
  pbe?: Spacing
  pbs?: Spacing
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'subtle'
}

export const P = forwardRef<HTMLParagraphElement, PropsWithChildren<ParagraphProps & TextStyleProps>>(
  function P({ align, children, pbe, pbs, size, variant, ...restProps }, ref) {
    const dataProperties = toDataProperties({
      align,
      pbe,
      pbs,
      size,
      variant,
    })

    return (
      <ReactAriaText elementType='p' {...restProps} {...dataProperties} className={P_CLASS_NAME} ref={ref}>
        {children}
      </ReactAriaText>
    )
  },
)

type SpanProps = Pick<ComponentPropsWithoutRef<'span'>, 'slot'>

const SPAN_CLASS_NAME = 'Layer__Span'

export const Span = forwardRef<HTMLSpanElement, PropsWithChildren<SpanProps & TextStyleProps & { noWrap?: boolean }>>(
  function Span({ align, children, noWrap, pbe, pbs, size, variant, ...restProps }, ref) {
    const dataProperties = toDataProperties({
      align,
      'no-wrap': noWrap,
      pbe,
      pbs,
      size,
      variant,
    })

    return (
      <ReactAriaText {...restProps} {...dataProperties} className={SPAN_CLASS_NAME} ref={ref}>
        {children}
      </ReactAriaText>
    )
  },
)

const LABEL_CLASS_NAME = 'Layer__Label'

type LabelProps = Pick<ComponentPropsWithoutRef<'label'>, 'slot'>

export const Label = forwardRef<HTMLLabelElement, PropsWithChildren<LabelProps & TextStyleProps>>(
  function Label({ align, children, pbe, pbs, size, variant, ...restProps }, ref) {
    const dataProperties = toDataProperties({
      align,
      pbe,
      pbs,
      size,
      variant,
    })

    return (
      <ReactAriaLabel {...restProps} {...dataProperties} className={LABEL_CLASS_NAME} ref={ref}>
        {children}
      </ReactAriaLabel>
    )
  },
)
