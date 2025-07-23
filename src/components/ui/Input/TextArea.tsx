import { forwardRef, type ComponentProps } from 'react'
import { TextArea as ReactAriaTextArea } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

const TEXTAREA_CLASS_NAME = 'Layer__UI__TextArea'
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
