import { Download, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useGetInvoicePdfDownload } from '@api/businesses/[business-id]/invoices/[invoice-id]/pdf/get'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'
import { Button } from '@ui/Button/Button'

type InvoicePdfDownloadButtonProps = {
  invoiceId: string
}

export const InvoicePdfDownloadButton = ({ invoiceId }: InvoicePdfDownloadButtonProps) => {
  const { t } = useTranslation()
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  const { trigger, isMutating, isError } = useGetInvoicePdfDownload({
    invoiceId,
    onSuccess: ({ presignedUrl, fileName }) => triggerInvisibleDownload({
      url: presignedUrl,
      filename: fileName,
    }),
  })

  const buttonText = isError
    ? t('common:action.retry_label', 'Retry')
    : t('invoices:InvoicePdfDownloadButton.action.download_pdf', 'Download PDF')

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
