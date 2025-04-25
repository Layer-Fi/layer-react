import {
  SearchField as ReactAriaSearchField,
  type SearchFieldProps as ReactAriaSearchFieldProps,
  Input as ReactAriaInput,
} from 'react-aria-components'
import { Button } from '../Button/Button'

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
      <Button slot='clear-button' variant='ghost' size='sm'>
        Clear
      </Button>
    </ReactAriaSearchField>
  )
}
