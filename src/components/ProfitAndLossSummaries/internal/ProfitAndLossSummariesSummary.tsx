import type { ReactNode } from 'react'
import type { Variants } from '../../../utils/styleUtils/sizeVariants'
import { SkeletonLoader } from '../../SkeletonLoader'
import { MoneySpan } from '../../ui/Typography/MoneyText'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import { ProfitAndLossSummariesHeading } from './ProfitAndLossSummariesHeading'

const CLASS_NAME = 'Layer__ProfitAndLossSummariesSummary'

const CHART_AREA_CLASS_NAME = 'Layer__ProfitAndLossSummariesSummaryChartArea'
const CHART_AREA_EMPTY_FRAME_CLASS_NAME = 'Layer__ProfitAndLossSummariesSummaryChartAreaEmptyFrame'

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
  const { size = '2xs' } = variants ?? {}

  const dataProperties = toDataProperties({ size })

  return (
    <div className={CLASS_NAME} {...dataProperties}>
      {Chart ? <div className={CHART_AREA_CLASS_NAME}>{Chart}</div> : <div className={CHART_AREA_EMPTY_FRAME_CLASS_NAME} />}
      <ProfitAndLossSummariesHeading variants={variants}>
        {label}
      </ProfitAndLossSummariesHeading>
      {isLoading
        ? (
          <SkeletonLoader height='20px' />
        )
        : (
          <MoneySpan slot='amount' amount={amount} size='lg' bold />
        )}
    </div>
  )
}
