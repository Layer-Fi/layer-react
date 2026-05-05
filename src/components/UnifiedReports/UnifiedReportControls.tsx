import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ReportControl } from '@schemas/reports/reportConfig'
import { AccountingMethod } from '@schemas/reports/unifiedReport'
import { useElementSize } from '@hooks/utils/size/useElementSize'
import { hasControl, useBaseUnifiedReport, useUnifiedReportAccountingMethodParam, useUnifiedReportDateSelectionMode, useUnifiedReportGroupByParam } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Stack, VStack } from '@ui/Stack/Stack'
import { Toggle, ToggleSize } from '@ui/Toggle/Toggle'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { CombinedDateSelection } from '@components/DateSelection/CombinedDateSelection'
import { DateGroupByComboBox } from '@components/DateSelection/DateGroupByComboBox'
import { GlobalYearPicker } from '@components/GlobalYearPicker/GlobalYearPicker'

import './unifiedReportControls.scss'

const SMALL_BREAKPOINT = 560
const MEDIUM_BREAKPOINT = 760

type ControlsVariant = 'small' | 'medium' | 'large'

const getVariantForWidth = (width: number): ControlsVariant => {
  if (width >= MEDIUM_BREAKPOINT) return 'large'
  if (width >= SMALL_BREAKPOINT) return 'medium'
  return 'small'
}

const UnifiedReportDateSelection = ({ isCompact }: { isCompact: boolean }) => {
  const { baseReport } = useBaseUnifiedReport()
  const dateSelectionMode = useUnifiedReportDateSelectionMode()

  const hasDateRange = hasControl(baseReport, ReportControl.DateRange)
  const hasDate = hasControl(baseReport, ReportControl.Date)

  if (!hasDateRange && !hasDate) return null

  return (
    <VStack>
      {hasDateRange && <CombinedDateRangeSelection mode={dateSelectionMode} isCompact={isCompact} />}
      {hasDate && <CombinedDateSelection mode={dateSelectionMode} isCompact={isCompact} />}
    </VStack>
  )
}

export const UnifiedReportControls = () => {
  const { t } = useTranslation()
  const { baseReport } = useBaseUnifiedReport()
  const { accountingMethod, setAccountingMethod } = useUnifiedReportAccountingMethodParam()
  const { groupBy, setGroupBy } = useUnifiedReportGroupByParam()
  const dateSelectionMode = useUnifiedReportDateSelectionMode()
  const [size, setSize] = useState(3)
  const accountingMethodOptions = useMemo(() => [
    {
      value: AccountingMethod.Accrual,
      label: t('reports:label.accrual', 'Accrual'),
    },
    {
      value: AccountingMethod.Cash,
      label: t('reports:label.cash', 'Cash'),
    },
  ], [t])

  const containerRef = useElementSize<HTMLDivElement>((size) => {
    setSize(size.width)
  })

  const variant = getVariantForWidth(size)

  const hasAccountingMethod = hasControl(baseReport, ReportControl.AccountingMethod)
  const hasGroupBy = dateSelectionMode === 'full' && hasControl(baseReport, ReportControl.GroupBy)
  const hasYear = hasControl(baseReport, ReportControl.Year)
  return (
    <Stack
      ref={containerRef}
      direction={variant === 'large' ? 'row' : 'column'}
      pb='md'
      pi='lg'
      gap='xs'
    >
      <UnifiedReportDateSelection isCompact={variant === 'small'} />
      {(hasYear || hasGroupBy || hasAccountingMethod) && (
        <div className='Layer__UnifiedReports__AdditionalControls' data-variant={variant}>
          {hasAccountingMethod && (
            <Toggle
              ariaLabel={t('reports:label.accounting_method', 'Accounting method')}
              options={accountingMethodOptions}
              selectedKey={accountingMethod}
              onSelectionChange={key => setAccountingMethod(key as AccountingMethod)}
              size={ToggleSize.small}
            />
          )}
          {hasYear && <GlobalYearPicker />}
          {hasGroupBy && <DateGroupByComboBox value={groupBy} onValueChange={setGroupBy} />}
        </div>
      )}
    </Stack>
  )
}
