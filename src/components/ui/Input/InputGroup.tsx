import { forwardRef } from 'react'
import {
  Group as ReactAriaGroup,
  type GroupProps as ReactAriaGroupProps,
} from 'react-aria-components'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import classNames from 'classnames'

import './inputGroup.scss'

const INPUT_GROUP_CLASS_NAME = 'Layer__InputGroup'

type InputGroupProps = ReactAriaGroupProps & {
  actionCount?: 1 | 2
  slots?: { badge?: React.FC }
}

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup({ actionCount, className, slots: slots, children, ...restProps }, ref) {
    const combinedClassName = classNames(INPUT_GROUP_CLASS_NAME, className)

    const dataProperties = toDataProperties({
      'action-count': actionCount,
    })

    return (
      <ReactAriaGroup
        {...restProps}
        {...dataProperties}
        className={combinedClassName}
        ref={ref}
      >
        {children}
      </ReactAriaGroup>
    )
  },
)
