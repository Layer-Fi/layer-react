import { forwardRef, useMemo } from 'react'
import type { PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

const P_CLASS_NAME = 'Layer__P'

type TextProps = {
  slot?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  pbe?: 'xs' | 'sm' | 'md' | 'lg'
  align?: 'center'
}

const P = forwardRef<HTMLParagraphElement, PropsWithChildren<TextProps>>(
  ({ align, children, pbe, size, ...restProps }, ref) => {
    const dataProperties = useMemo(() => toDataProperties({
      align,
      pbe,
      size
    }), [align, pbe, size])

    return (
      <p {...restProps} {...dataProperties} className={P_CLASS_NAME} ref={ref}>
        {children}
      </p>
    )
  }
)
P.displayName = 'P'

export { P }
