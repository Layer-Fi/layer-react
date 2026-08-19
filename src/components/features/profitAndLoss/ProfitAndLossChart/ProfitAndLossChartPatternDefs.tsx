import { useId, useMemo } from 'react'

import { toDataProperties } from '@utils/shared/styles/toDataProperties'

import './profitAndLossChartPatternDefs.scss'

export type StripePatternVariant = 'income' | 'expenses'

type StripePatterns = {
  ids: Record<StripePatternVariant, string>
  fills: Record<StripePatternVariant, string>
}

export const useStripePatterns = (): StripePatterns => {
  const instanceId = useId()

  return useMemo(() => {
    // `useId` emits colons, which are not valid in the fragment of a `url(#…)` reference.
    const suffix = instanceId.replace(/[^a-zA-Z0-9-]/g, '')

    const ids = {
      income: `layer-bar-stripe-pattern-income-${suffix}`,
      expenses: `layer-bar-stripe-pattern-expenses-${suffix}`,
    }

    return {
      ids,
      fills: {
        income: `url(#${ids.income})`,
        expenses: `url(#${ids.expenses})`,
      },
    }
  }, [instanceId])
}

const StripePattern = ({ id, variant }: { id: string, variant: StripePatternVariant }) => (
  <pattern
    id={id}
    className='Layer__ProfitAndLossChart__StripePattern'
    x='0'
    y='0'
    width='4'
    height='4'
    patternTransform='rotate(45)'
    patternUnits='userSpaceOnUse'
    {...toDataProperties({ variant })}
  >
    <rect width='4' height='4' opacity={0.16} />
    <line x1='0' y='0' x2='0' y2='4' strokeWidth='2' />
  </pattern>
)

export const ProfitAndLossChartPatternDefs = ({ ids }: { ids: StripePatterns['ids'] }) => (
  <defs>
    <StripePattern id={ids.income} variant='income' />
    <StripePattern id={ids.expenses} variant='expenses' />
  </defs>
)
