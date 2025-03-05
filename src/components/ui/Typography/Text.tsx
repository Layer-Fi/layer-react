import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import type { PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'

const CLASS_NAME = 'Layer__P'

type TextProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  pbe?: Spacing
  pbs?: Spacing
  align?: 'center'
  variant?: 'subtle'
} & Pick<ComponentPropsWithoutRef<'p'>, 'slot'>

const P = forwardRef<HTMLParagraphElement, PropsWithChildren<TextProps>>(
  ({ align, children, pbe, pbs, size, variant, ...restProps }, ref) => {
    const dataProperties = toDataProperties({
      align,
      pbe,
      pbs,
      size,
      variant,
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
