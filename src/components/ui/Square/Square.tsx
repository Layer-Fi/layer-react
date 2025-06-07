import { forwardRef, type PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

const CLASS_NAME = 'Layer__Square'

type SquareProps = {
  size?: 'sm'
}

export const Square = forwardRef<HTMLDivElement, PropsWithChildren<SquareProps>>(
  function Square({ children, size = 'sm', ...restProps }, ref) {
    const dataProperties = toDataProperties({ size })

    return (
      <div
        {...restProps}
        {...dataProperties}
        className={CLASS_NAME}
        ref={ref}
      >
        {children}
      </div>
    )
  },
)
