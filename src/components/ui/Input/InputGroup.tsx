import { forwardRef } from 'react'
import {
  Group as ReactAriaGroup,
  type GroupProps as ReactAriaGroupProps,
} from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

const INPUT_GROUP_CLASS_NAME = 'Layer__InputGroup'

type InputGroupProps = ReactAriaGroupProps & {
  actionCount?: 1 | 2
}

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup({ actionCount, ...restProps }, ref) {
    const dataProperties = toDataProperties({ 'action-count': actionCount })

    return (
      <ReactAriaGroup
        {...restProps}
        {...dataProperties}
        className={INPUT_GROUP_CLASS_NAME}
        ref={ref}
      />
    )
  },
)
