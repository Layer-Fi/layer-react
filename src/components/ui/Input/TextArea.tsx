import { type ComponentProps, forwardRef } from 'react'
import { TextArea as ReactAriaTextArea } from 'react-aria-components/TextArea'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'

import './textArea.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__UI__TextArea: 'Layer__textarea',
})

const TEXTAREA_CLASS_NAME = legacyClassNames('Layer__UI__TextArea')
type TextAreaProps = Omit<ComponentProps<typeof ReactAriaTextArea>, 'className'> & {
  resize?: 'both' | 'vertical' | 'horizontal' | 'none'
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ resize = 'none', ...restProps }, ref) {
    const dataProperties = toDataProperties({ resize })

    return (
      <ReactAriaTextArea
        {...restProps}
        {...dataProperties}
        className={TEXTAREA_CLASS_NAME}
        ref={ref}
      />
    )
  },
)
