import { CloudDownload, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useUnifiedReportExcel } from '@hooks/api/businesses/[business-id]/reports/unified/report-name/exports/excel/useUnifiedReportExcel'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Button } from '@ui/Button/Button'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type UnifiedReportDownloadButtonProps = {
  iconOnly?: boolean
}

export function UnifiedReportDownloadButton({ iconOnly }: UnifiedReportDownloadButtonProps) {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const resolvedIconOnly = iconOnly ?? !isDesktop
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
        icon={resolvedIconOnly}
        aria-label={resolvedIconOnly ? buttonText : undefined}
      >
        {!resolvedIconOnly && buttonText}
        {isError ? <RefreshCcw size={12} /> : <CloudDownload size={16} /> }
      </Button>
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
