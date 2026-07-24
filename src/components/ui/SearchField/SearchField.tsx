import classNames from 'classnames'
import { Search, X } from 'lucide-react'
import { Input as ReactAriaInput } from 'react-aria-components/Input'
import { SearchField as ReactAriaSearchField } from 'react-aria-components/SearchField'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { InputGroup } from '@ui/Input/InputGroup'
import { VStack } from '@ui/Stack/Stack'

import './searchField.scss'

const CLASS_NAME = 'Layer__SearchField'

export type SearchFieldProps = {
  value: string
  slot?: string
  onChange: (value: string) => void
  label: string
  isDisabled?: boolean
  className?: string
}

export function SearchField({ slot = 'search', className, label, isDisabled, ...restProps }: SearchFieldProps) {
  const { t } = useTranslation()
  const combinedClassName = classNames(CLASS_NAME, className)

  return (
    <InputGroup slot={slot} className={combinedClassName}>
      <VStack slot='icon' align='center' justify='center' className='Layer__SearchField__Icon' data-disabled={isDisabled || undefined}>
        <Search size={14} />
      </VStack>
      <ReactAriaSearchField
        {...restProps}
        aria-label={label}
        isDisabled={isDisabled}
        className='Layer__SearchField__Field'
      >
        <ReactAriaInput slot='input' placeholder={label} />
        <Button slot='clear-button' inset icon variant='ghost' aria-label={t('ui:action.clear_search', 'Clear search')}>
          <X size={18} />
        </Button>
      </ReactAriaSearchField>
    </InputGroup>
  )
}
