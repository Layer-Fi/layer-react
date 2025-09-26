import { forwardRef, type ReactNode } from 'react'
import {
  Group as ReactAriaGroup,
  type GroupProps as ReactAriaGroupProps,
} from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import { HStack } from '../Stack/Stack'

const INPUT_GROUP_CLASS_NAME = 'Layer__InputGroup'

type InputGroupProps = ReactAriaGroupProps & {
  actionCount?: 1 | 2
  rightSlot?: ReactNode
}

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup({ actionCount, rightSlot, children, ...restProps }, ref) {
    const dataProperties = toDataProperties({
      'action-count': actionCount,
      'has-right-slot': !!rightSlot,
    })

    return (
      <ReactAriaGroup
        {...restProps}
        {...dataProperties}
        className={INPUT_GROUP_CLASS_NAME}
        ref={ref}
      >
        {renderProps => (
          <>
            {typeof children === 'function' ? children(renderProps) : children}
            {rightSlot && <HStack justify='end'>{rightSlot}</HStack>}
          </>
        )}
      </ReactAriaGroup>
    )
  },
)
