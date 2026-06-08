import { X } from 'lucide-react'
import { Input as ReactAriaInput } from 'react-aria-components/Input'
import {
  SearchField as ReactAriaSearchField,
  type SearchFieldProps as ReactAriaSearchFieldProps,
} from 'react-aria-components/SearchField'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  return (
    <ReactAriaSearchField {...restProps} isDisabled={isDisabled} className={CLASS_NAME}>
      <ReactAriaInput
        slot='input'
        placeholder={placeholder}
      />
      <Button slot='clear-button' inset icon variant='ghost' aria-label={t('ui:action.clear_search', 'Clear search')}>
        <X size={18} />
      </Button>
    </ReactAriaSearchField>
  )
}
