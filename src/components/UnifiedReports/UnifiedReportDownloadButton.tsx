import { useTranslation } from 'react-i18next'

import { useUnifiedReportExcel } from '@hooks/api/businesses/[business-id]/reports/unified/report-name/exports/excel/useUnifiedReportExcel'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import DownloadCloud from '@icons/DownloadCloud'
import RefreshCcw from '@icons/RefreshCcw'
import { Button } from '@ui/Button/Button'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

export function UnifiedReportDownloadButton() {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

  const { trigger, isMutating, isError } = useUnifiedReportExcel({
    onSuccess: ({ presignedUrl }) => triggerInvisibleDownload({ url: presignedUrl }),
  })

  const buttonText = isError
    ? t('common:action.retry_label', 'Retry')
    : t('common:action.download_label', 'Download')

  return (
    <>
      <Button
        variant='outlined'
        onPress={() => { void trigger() }}
        isPending={isMutating}
        isDisabled={isMutating}
        icon={!isDesktop}
        aria-label={!isDesktop ? buttonText : undefined}
      >
        {isDesktop && buttonText}
        {isError ? <RefreshCcw size={12} /> : <DownloadCloud size={16} /> }
      </Button>
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
