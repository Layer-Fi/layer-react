import { useTranslation } from 'react-i18next'

import { useUnifiedReportExcel } from '@hooks/api/businesses/[business-id]/reports/unified/report-name/exports/excel/useUnifiedReportExcel'
import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import DownloadCloud from '@icons/DownloadCloud'
import RefreshCcw from '@icons/RefreshCcw'
import { Button } from '@ui/Button/Button'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type UnifiedReportDownloadButtonProps = {
  dateSelectionMode: DateSelectionMode
}

export function UnifiedReportDownloadButton({ dateSelectionMode }: UnifiedReportDownloadButtonProps) {
  const { t } = useTranslation()
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

  const { trigger, isMutating, isError } = useUnifiedReportExcel({
    dateSelectionMode,
    onSuccess: ({ presignedUrl }) => triggerInvisibleDownload({ url: presignedUrl }),
  })

  return (
    <>
      <Button
        variant='outlined'
        onPress={() => { void trigger() }}
        isPending={isMutating}
        isDisabled={isMutating}
      >
        {isError ? t('common:action.retry_label', 'Retry') : t('common:action.download_label', 'Download')}
        {isError ? <RefreshCcw size={12} /> : <DownloadCloud size={16} /> }
      </Button>
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
