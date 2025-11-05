import { Heading } from '../../ui/Typography/Heading'
import type { PropsWithChildren } from 'react'
import type { Variants } from '../../../utils/styleUtils/sizeVariants'

export function ProfitAndLossSummariesHeading({
  variants,
  children,
}: PropsWithChildren<{ variants?: Pick<Variants, 'size'> }>) {
  const { size = '2xs' } = variants ?? {}

  return (
    <Heading level={3} size={size} slot='heading'>
      {children}
    </Heading>
  )
}
