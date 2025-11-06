import { Button as ReactAriaButton } from 'react-aria-components'
import { forwardRef } from 'react'
import { type ButtonProps } from 'react-aria-components'
import { withRenderProp } from '@components/utility/withRenderProp'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import './pill.scss'

type PillStatus = 'error'

type PillProps = Pick<
  ButtonProps,
  'children' | 'onHoverStart' | 'onPress'
> & {
  status?: PillStatus
}

const PILL_CLASS_NAME = 'Layer__Pill'
export const Pill = forwardRef<HTMLButtonElement, PillProps>(
  function Pill({ children, status, ...restProps }, ref) {
    const dataProperties = toDataProperties({ status })

    return (
      <ReactAriaButton
        {...restProps}
        {...dataProperties}
        className={PILL_CLASS_NAME}
        ref={ref}
      >
        {withRenderProp(children, node => node)}
      </ReactAriaButton>
    )
  },
)
