import { ArrowUpRight } from 'lucide-react'
import { type PressEvent } from 'react-aria-components'

import { Button } from '@ui/Button/Button'

export type ExpandSummaryCardButtonProps = {
  callback: (event: PressEvent) => void
  ariaLabel: string
}

export function ExpandSummaryCardButton({ callback, ariaLabel }: ExpandSummaryCardButtonProps) {
  return (
    <Button
      variant='outlined'
      onPress={callback}
      aria-label={ariaLabel}
    >
      <ArrowUpRight />
    </Button>
  )
}
