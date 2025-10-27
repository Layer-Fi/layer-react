import { forwardRef, type PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import './square.scss'

const CLASS_NAME = 'Layer__Square'

type SquareProps = {
  inset?: true
}

export const Square = forwardRef<HTMLDivElement, PropsWithChildren<SquareProps>>(
  function Square({ children, inset, ...restProps }, ref) {
    const dataProperties = toDataProperties({ inset })

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
