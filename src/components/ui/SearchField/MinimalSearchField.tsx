import {
  Input as ReactAriaInput,
  SearchField as ReactAriaSearchField,
  type SearchFieldProps as ReactAriaSearchFieldProps,
} from 'react-aria-components'

import X from '@icons/X'
import { Button } from '@ui/Button/Button'

import './minimalSearchField.scss'

const CLASS_NAME = 'Layer__MinimalSearchField'

type MinimalSearchFieldProps = ReactAriaSearchFieldProps & {
  placeholder?: string
}

export function MinimalSearchField({
  placeholder,
  isDisabled,
  ...restProps
}: MinimalSearchFieldProps) {
  return (
    <ReactAriaSearchField {...restProps} isDisabled={isDisabled} className={CLASS_NAME}>
      <ReactAriaInput
        slot='input'
        placeholder={placeholder}
      />
      <Button slot='clear-button' inset icon variant='ghost' aria-label='Clear search'>
        <X />
      </Button>
    </ReactAriaSearchField>
  )
}
