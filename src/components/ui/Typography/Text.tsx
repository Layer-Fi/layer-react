import React, { forwardRef, useMemo } from 'react'
import type { PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

const P_CLASS_NAME = 'Layer__P'

type TextProps = {
  slot?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  pbe?: 'xs' | 'sm' | 'md' | 'lg'
}

const P = forwardRef<HTMLParagraphElement, PropsWithChildren<TextProps>>(
  ({ children, pbe, size, ...restProps }, ref) => {
    const dataProperties = useMemo(() => toDataProperties({ pbe, size }), [pbe, size])

    return (
      <p {...restProps} {...dataProperties} className={P_CLASS_NAME} ref={ref}>
        {children}
      </p>
    )
  }
)
P.displayName = 'P'

export { P }
