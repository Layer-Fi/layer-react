import { useMemo, type ReactNode } from 'react'
import { centsToDollars as formatMoney } from '../../../models/Money'
import type { Variants } from '../../../utils/styleUtils/sizeVariants'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import { SkeletonLoader } from '../../SkeletonLoader'
import { ProfitAndLossSummariesHeading } from './ProfitAndLossSummariesHeading'

const CLASS_NAME = 'Layer__ProfitAndLossSummariesSummary'

const CHART_AREA_CLASS_NAME = 'Layer__ProfitAndLossSummariesSummaryChartArea'
const AMOUNT_CLASS_NAME = 'Layer__ProfitAndLossSummariesSummaryAmount'

type ProfitAndLossSummariesSummaryProps = {
  label: string
  amount: number
  isLoading?: boolean
  slots?: {
    Chart: ReactNode
  }
  variants?: Variants
}

export function ProfitAndLossSummariesSummary({
  label,
  amount,
  isLoading,
  slots,
  variants,
}: ProfitAndLossSummariesSummaryProps) {
  const { Chart } = slots ?? {}
  const { size = 'sm' } = variants ?? {}

  const dataProperties = useMemo(() => toDataProperties({ size }), [size])
  const amountDataProperties = useMemo(
    () =>
      toDataProperties({
        positive: amount >= 0,
        negative: amount < 0,
        size,
      }),
    [amount, size],
  )

  return (
    <div className={CLASS_NAME} {...dataProperties}>
      {Chart && <div className={CHART_AREA_CLASS_NAME}>{Chart}</div>}
      <ProfitAndLossSummariesHeading variants={variants}>
        {label}
      </ProfitAndLossSummariesHeading>
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <span className={AMOUNT_CLASS_NAME} {...amountDataProperties}>
          {formatMoney(Math.abs(amount))}
        </span>
      )}
    </div>
  )
}
