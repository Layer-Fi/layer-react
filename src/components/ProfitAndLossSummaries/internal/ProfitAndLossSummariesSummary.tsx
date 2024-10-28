import React, { useMemo, type ReactNode } from 'react'
import { centsToDollars as formatMoney } from '../../../models/Money'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import { SkeletonLoader } from '../../SkeletonLoader'

const CLASS_NAME = 'Layer__ProfitAndLossSummariesSummary'

const CHART_AREA_CLASS_NAME = 'Layer__ProfitAndLossSummariesSummaryChartArea'
const HEADING_CLASS_NAME = 'Layer__ProfitAndLossSummariesSummaryHeading'
const AMOUNT_CLASS_NAME = 'Layer__ProfitAndLossSummariesSummaryAmount'

type ProfitAndLossSummariesSummaryProps = {
  label: string
  amount: number
  isLoading?: boolean
  slots?: {
    Chart: ReactNode
  }
  variants?: {
    size: 'sm' | 'lg'
  }
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
  const labelDataProperties = useMemo(() => toDataProperties({ size }), [size])
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
      <h3 className={HEADING_CLASS_NAME} {...labelDataProperties}>
        {label}
      </h3>
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
