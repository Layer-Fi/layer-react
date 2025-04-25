import { Group } from 'react-aria-components'
import { Search } from 'lucide-react'
import { MinimalSearchField } from '../../../ui/SearchField/MinimalSearchField'
import { VStack } from '../../../ui/Stack/Stack'

const CLASS_NAME = 'Layer__TransactionsSearchField'

type TransactionsSearchFieldProps = {
  value: string
  slot?: string
  onChange: (value: string) => void
}

export function TransactionsSearchField({ slot, ...restProps }: TransactionsSearchFieldProps) {
  return (
    <Group slot={slot} className={CLASS_NAME}>
      <VStack slot='icon' align='center' justify='center'>
        <Search size={14} />
      </VStack>
      <MinimalSearchField
        {...restProps}
        slot='search'
        placeholder='Search transactions'
      />
    </Group>
  )
}
