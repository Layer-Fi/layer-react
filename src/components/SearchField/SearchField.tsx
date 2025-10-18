import { Group } from 'react-aria-components'
import { Search } from 'lucide-react'
import { MinimalSearchField } from '../ui/SearchField/MinimalSearchField'
import { VStack } from '../ui/Stack/Stack'

const CLASS_NAME = 'Layer__SearchField Layer__InputGroup'

export type SearchFieldProps = {
  value: string
  slot?: string
  onChange: (value: string) => void
  label: string
  isDisabled?: boolean
}

export function SearchField({ slot = 'search', label, isDisabled, ...restProps }: SearchFieldProps) {
  return (
    <Group slot={slot} className={CLASS_NAME}>
      <VStack slot='icon' align='center' justify='center'>
        <Search size={14} />
      </VStack>
      <MinimalSearchField
        {...restProps}
        placeholder={label}
        aria-label={label}
        isDisabled={isDisabled}
      />
    </Group>
  )
}
