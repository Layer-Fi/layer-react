import { Download, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useInvoicePdfDownload } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/pdf/useInvoicePdfDownload'
import { Button } from '@ui/Button/Button'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

type InvoicePdfDownloadButtonProps = {
  invoiceId: string
}

export const InvoicePdfDownloadButton = ({ invoiceId }: InvoicePdfDownloadButtonProps) => {
  const { t } = useTranslation()
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  const { trigger, isMutating, isError } = useInvoicePdfDownload({
    invoiceId,
    onSuccess: ({ presignedUrl, fileName }) => triggerInvisibleDownload({
      url: presignedUrl,
      filename: fileName,
    }),
  })

  const buttonText = isError
    ? t('common:action.retry_label', 'Retry')
    : t('invoices:action.download_pdf', 'Download PDF')

  return (
    <>
      <Button isPending={isMutating} isDisabled={isMutating} onPress={() => { void trigger() }}>
        {buttonText}
        {isError ? <RefreshCcw size={14} /> : <Download size={14} />}
      </Button>
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}
