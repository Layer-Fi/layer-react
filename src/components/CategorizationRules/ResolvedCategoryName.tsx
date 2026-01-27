import { accountIdentifierIsForCategory } from '@internal-types/categories'
import type { AccountIdentifier } from '@schemas/accountIdentifier'
import type { NestedCategorization } from '@schemas/categorization'
import { Span, type TextStyleProps } from '@ui/Typography/Text'

type ResolvedCategoryNameProps = {
  accountIdentifier: AccountIdentifier
  options: NestedCategorization[]
  slotProps?: {
    Span?: TextStyleProps
  }
}

export const ResolvedCategoryName = ({ accountIdentifier, options, slotProps }: ResolvedCategoryNameProps) => {
  const category = options.find(cat =>
    accountIdentifierIsForCategory(accountIdentifier, cat),
  )

  if (!category) return null

  return <Span {...slotProps?.Span} ellipsis>{category.displayName}</Span>
}
