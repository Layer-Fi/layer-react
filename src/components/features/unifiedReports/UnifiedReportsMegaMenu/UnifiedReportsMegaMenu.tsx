import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useGetReportConfig } from '@api/businesses/[business-id]/reports/config/get'
import { useBaseUnifiedReport } from '@providers/features/unifiedReports/UnifiedReportStore/UnifiedReportStoreProvider'
import { Button } from '@ui/Button/Button'
import { Span } from '@ui/Typography/Text'
import { MegaMenu } from '@blocks/NestedNavigation/MegaMenu/MegaMenu'
import {
  buildFlatReportsGroupConfig,
  buildReportsLeafConfig,
} from '@features/unifiedReports/utils'

const groupConfig = buildFlatReportsGroupConfig(
  group => <Span size='sm' weight='bold' variant='subtle' textCase='uppercase'>{group.displayName}</Span>,
)

const renderLeafLabel = (leaf: { displayName: string }) => (
  <Span>{leaf.displayName}</Span>
)

const EMPTY_ARRAY: never[] = []

export function UnifiedReportsMegaMenu() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetReportConfig()
  const { baseReport, setBaseReport } = useBaseUnifiedReport()

  const leafConfig = useMemo(
    () => buildReportsLeafConfig(setBaseReport, renderLeafLabel),
    [setBaseReport],
  )

  const Trigger = useMemo(() => (
    <Button variant='outlined' isPending={isLoading} isDisabled={isError}>
      {t('unifiedReports:UnifiedReportsMegaMenu.label.switch_report', 'Switch report')}
      <ChevronDown size={14} />
    </Button>
  ), [t, isLoading, isError])

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
