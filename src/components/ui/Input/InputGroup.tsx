import { forwardRef } from 'react'
import classNames from 'classnames'
import { composeRenderProps } from 'react-aria-components/composeRenderProps'
import {
  Group as ReactAriaGroup,
  type GroupProps as ReactAriaGroupProps,
} from 'react-aria-components/Group'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { Span } from '@ui/Typography/Text'

import './inputGroup.scss'

const INPUT_GROUP_CLASS_NAME = 'Layer__UI__InputGroup'

type InputGroupProps = ReactAriaGroupProps & {
  actionCount?: 1 | 2
  leadingText?: string
  slots?: { badge?: React.FC }
}

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup({ actionCount, leadingText, className, slots: slots, children, ...restProps }, ref) {
    const combinedClassName = classNames(INPUT_GROUP_CLASS_NAME, className)

    const dataProperties = toDataProperties({
      'action-count': actionCount,
      'leading-text': Boolean(leadingText) || undefined,
    })

    return (
      <ReactAriaGroup
        {...restProps}
        {...dataProperties}
        className={combinedClassName}
        ref={ref}
      >
        {composeRenderProps(children, node => (
          <>
            {leadingText && (
              <Span className={`${INPUT_GROUP_CLASS_NAME}__LeadingText`}>
                {leadingText}
              </Span>
            )}
            {node}
          </>
        ))}
      </ReactAriaGroup>
    )
  },
)
