import {
  SearchField as ReactAriaSearchField,
  type SearchFieldProps as ReactAriaSearchFieldProps,
  Input as ReactAriaInput,
} from 'react-aria-components'
import { Button } from '../Button/Button'
import X from '../../../icons/X'
import './minimalSearchField.scss'

const CLASS_NAME = 'Layer__MinimalSearchField'

type MinimalSearchFieldProps = ReactAriaSearchFieldProps & {
  placeholder?: string
}

export function MinimalSearchField({
  placeholder,
  ...restProps
}: MinimalSearchFieldProps) {
  return (
    <ReactAriaSearchField {...restProps} className={CLASS_NAME}>
      <ReactAriaInput slot='input' placeholder={placeholder} />
      <Button slot='clear-button' inset icon variant='ghost' aria-label='Clear search'>
        <X />
      </Button>
    </ReactAriaSearchField>
  )
}
