import { CloudDownload, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useActiveUnifiedReport } from '@providers/features/unifiedReports/UnifiedReportStore/UnifiedReportStoreProvider'
import { useUnifiedReportExcel } from '@hooks/features/reports/useUnifiedReport'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'
import { Button } from '@ui/Button/Button'

type UnifiedReportDownloadButtonProps = {
  icon?: boolean
}

export function UnifiedReportDownloadButton({ icon }: UnifiedReportDownloadButtonProps) {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const resolvedIcon = icon ?? !isDesktop
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

  const { trigger, isMutating, isError } = useUnifiedReportExcel({
    onSuccess: ({ presignedUrl }) => triggerInvisibleDownload({ url: presignedUrl }),
  })

  const { report } = useActiveUnifiedReport()
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.UnifiedReports)

  const onPress = () => {
    // No active report means no export route/params — don't fire a request against an empty route.
    if (!report) return

    emitLayerEvent({
      type: LayerEventType.ReportsDownloadClicked,
      version: 1,
      payload: { reportKey: report.key },
    })
    void trigger()
  }

  const buttonText = isError
    ? t('common:action.retry_label', 'Retry')
    : t('common:action.download_label', 'Download')

  return (
    <>
      <Button
        variant='outlined'
        onPress={onPress}
        isPending={isMutating}
        isDisabled={isMutating || !report}
        icon={resolvedIcon}
        aria-label={resolvedIcon ? buttonText : undefined}
      >
        {!resolvedIcon && buttonText}
        {isError ? <RefreshCcw size={12} /> : <CloudDownload size={16} /> }
      </Button>
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
