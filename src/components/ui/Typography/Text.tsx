import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import type { PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

const CLASS_NAME = 'Layer__P'

type TextProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  pbe?: 'xs' | 'sm' | 'md' | 'lg'
  align?: 'center'
} & Pick<ComponentPropsWithoutRef<'p'>, 'slot'>

const P = forwardRef<HTMLParagraphElement, PropsWithChildren<TextProps>>(
  ({ align, children, pbe, size, ...restProps }, ref) => {
    const dataProperties = toDataProperties({
      align,
      pbe,
      size,
    })

    return (
      <p {...restProps} {...dataProperties} className={CLASS_NAME} ref={ref}>
        {children}
      </p>
    )
  },
)
P.displayName = 'P'

export { P }
