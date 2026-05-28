import { useTranslation } from 'react-i18next'

import { useInvoicePdfDownload } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/pdf/useInvoicePdfDownload'
import { DownloadButton } from '@components/Button/DownloadButton'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type InvoicePdfDownloadButtonProps = {
  invoiceId: string
}

export const InvoicePdfDownloadButton = ({ invoiceId }: InvoicePdfDownloadButtonProps) => {
  const { t } = useTranslation()
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  const { trigger, isMutating, error } = useInvoicePdfDownload({
    invoiceId,
    onSuccess: ({ presignedUrl, fileName }) => triggerInvisibleDownload({
      url: presignedUrl,
      filename: fileName,
    }),
  })

  return (
    <>
      <DownloadButton
        onClick={() => { void trigger() }}
        isDownloading={isMutating}
        requestFailed={Boolean(error)}
        text={t('invoices:action.download_pdf', 'Download PDF')}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
