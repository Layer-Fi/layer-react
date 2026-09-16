import type { AccountIdentifier } from '@schemas/common/accountIdentifier'
import type { NestedCategorization } from '@schemas/features/categorization/nestedCategorization'
import { getResolvedCategoryName } from '@utils/features/categorization/categories'
import { Span, type TextStyleProps } from '@ui/Typography/Text'

type ResolvedCategoryNameProps = {
  accountIdentifier: AccountIdentifier
  options: NestedCategorization[]
  slotProps?: {
    Span?: TextStyleProps
  }
}

export const ResolvedCategoryName = ({ accountIdentifier, options, slotProps }: ResolvedCategoryNameProps) => {
  const name = getResolvedCategoryName(accountIdentifier, options)

  if (!name) return null

  return <Span {...slotProps?.Span} ellipsis>{name}</Span>
}
