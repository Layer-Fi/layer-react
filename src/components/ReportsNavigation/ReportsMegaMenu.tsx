import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useReportConfig } from '@hooks/api/businesses/[business-id]/reports/config/useReportConfig'
import { useBaseUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Button } from '@ui/Button/Button'
import { Span } from '@ui/Typography/Text'
import { MegaMenu } from '@components/NestedNavigation/MegaMenu/MegaMenu'
import {
  buildFlatReportsGroupConfig,
  buildReportsLeafConfig,
} from '@components/ReportsNavigation/utils'

const groupConfig = buildFlatReportsGroupConfig(
  group => <Span size='sm' weight='bold' variant='subtle' textCase='uppercase'>{group.displayName}</Span>,
)

const renderLeafLabel = (leaf: { displayName: string }) => (
  <Span>{leaf.displayName}</Span>
)

const EMPTY_ARRAY: never[] = []

export function ReportsMegaMenu() {
  const { t } = useTranslation()
  const { data } = useReportConfig()
  const { baseReport, setBaseReport } = useBaseUnifiedReport()

  const leafConfig = useMemo(
    () => buildReportsLeafConfig(setBaseReport, renderLeafLabel),
    [setBaseReport],
  )

  const Trigger = useMemo(() => (
    <Button variant='outlined'>
      {t('reports:label.switch_report', 'Switch report')}
      <ChevronDown size={14} />
    </Button>
  ), [t])

  return (
    <MegaMenu
      items={data ?? EMPTY_ARRAY}
      selectedItem={baseReport?.key ?? null}
      placement='bottom left'
      groupConfig={groupConfig}
      leafConfig={leafConfig}
      slots={{ Trigger }}
    />
  )
}
