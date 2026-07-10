import type { PropsWithChildren } from 'react'

import type { Variants } from '@utils/styleUtils/sizeVariants'
import { Span } from '@ui/Typography/Text'

const SPAN_SIZE_BY_VARIANT_SIZE = { sm: 'lg', lg: 'xl' } as const

/** A tile label, not a document heading - it names a single value rather than a content section. */
export function ProfitAndLossSummariesLabel({
  variants,
  children,
}: PropsWithChildren<{ variants?: Pick<Variants, 'size'> }>) {
  const size = variants?.size ? SPAN_SIZE_BY_VARIANT_SIZE[variants.size] : 'sm'

  return (
    <Span size={size} weight='bold'>
      {children}
    </Span>
  )
}
