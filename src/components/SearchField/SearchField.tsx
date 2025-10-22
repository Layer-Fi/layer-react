import { Search } from 'lucide-react'
import { MinimalSearchField } from '../ui/SearchField/MinimalSearchField'
import { VStack } from '../ui/Stack/Stack'
import { InputGroup } from '../ui/Input/InputGroup'
import classNames from 'classnames'
import './searchField.scss'

const CLASS_NAME = 'Layer__SearchField'

export type SearchFieldProps = {
  value: string
  slot?: string
  onChange: (value: string) => void
  label: string
  className?: string
}

export function SearchField({ slot = 'search', className, label, ...restProps }: SearchFieldProps) {
  const combinedClassName = classNames(CLASS_NAME, className)

  return (
    <InputGroup slot={slot} className={combinedClassName}>
      <VStack slot='icon' align='center' justify='center'>
        <Search size={14} />
      </VStack>
      <MinimalSearchField
        {...restProps}
        placeholder={label}
        aria-label={label}
      />
    </InputGroup>
  )
}
