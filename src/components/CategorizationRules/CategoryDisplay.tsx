import { accountIdentifierIsForCategory } from '@internal-types/categories'
import type { AccountIdentifier } from '@schemas/accountIdentifier'
import type { NestedCategorization } from '@schemas/categorization'
import { Span } from '@ui/Typography/Text'

type CategoryDisplayProps = {
  accountIdentifier: AccountIdentifier
  options: NestedCategorization[]
}

export const CategoryDisplay = ({ accountIdentifier, options }: CategoryDisplayProps) => {
  const category = options.find(cat =>
    accountIdentifierIsForCategory(accountIdentifier, cat),
  )

  if (!category) return null

  return <Span ellipsis>{category.displayName}</Span>
}
