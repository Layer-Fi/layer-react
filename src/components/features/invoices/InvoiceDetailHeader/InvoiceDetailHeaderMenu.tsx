import { useCallback, useState } from 'react'
import { Menu as MenuIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { useGetInvoicePdfDownload } from '@api/businesses/[business-id]/invoices/[invoice-id]/pdf/get'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useInvoiceDetail, useInvoiceNavigation } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Span } from '@ui/Typography/Text'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'
import { InvoiceRefundModal } from '@features/invoices/InvoiceRefundModal/InvoiceRefundModal'
import { InvoiceResetConfirmationModal } from '@features/invoices/InvoiceResetConfirmationModal/InvoiceResetConfirmationModal'
import { InvoiceVoidConfirmationModal } from '@features/invoices/InvoiceVoidConfirmationModal/InvoiceVoidConfirmationModal'
import { InvoiceWriteoffConfirmationModal } from '@features/invoices/InvoiceWriteoffConfirmationModal/InvoiceWriteoffConfirmationModal'

enum InvoiceDetailHeaderMenuActions {
  Edit = 'Edit',
  DownloadPdf = 'DownloadPdf',
  Void = 'Void',
  Refund = 'Refund',
  Writeoff = 'Writeoff',
  Reset = 'Reset',
}

type InvoiceActionModalType = Exclude<
  InvoiceDetailHeaderMenuActions,
  InvoiceDetailHeaderMenuActions.Edit | InvoiceDetailHeaderMenuActions.DownloadPdf
>

const availableActions: Record<InvoiceStatus, InvoiceDetailHeaderMenuActions[]> = {
  [InvoiceStatus.Draft]: [
    InvoiceDetailHeaderMenuActions.Edit,
  ],
  [InvoiceStatus.Saved]: [
    InvoiceDetailHeaderMenuActions.Edit,
    InvoiceDetailHeaderMenuActions.DownloadPdf,
    InvoiceDetailHeaderMenuActions.Void,
    InvoiceDetailHeaderMenuActions.Writeoff,
  ],
  [InvoiceStatus.PartiallyPaid]: [
    InvoiceDetailHeaderMenuActions.DownloadPdf,
    InvoiceDetailHeaderMenuActions.Writeoff,
    InvoiceDetailHeaderMenuActions.Reset,
  ],
  [InvoiceStatus.Paid]: [
    InvoiceDetailHeaderMenuActions.DownloadPdf,
    InvoiceDetailHeaderMenuActions.Refund,
    InvoiceDetailHeaderMenuActions.Reset,
  ],
  [InvoiceStatus.Voided]: [
    InvoiceDetailHeaderMenuActions.DownloadPdf,
    InvoiceDetailHeaderMenuActions.Reset,
  ],
  [InvoiceStatus.PartiallyWrittenOff]: [
    InvoiceDetailHeaderMenuActions.DownloadPdf,
    InvoiceDetailHeaderMenuActions.Reset,
  ],
  [InvoiceStatus.WrittenOff]: [
    InvoiceDetailHeaderMenuActions.DownloadPdf,
    InvoiceDetailHeaderMenuActions.Reset,
  ],
  [InvoiceStatus.Refunded]: [
    InvoiceDetailHeaderMenuActions.DownloadPdf,
    InvoiceDetailHeaderMenuActions.Reset,
  ],
}

const getInvoiceActions = (invoice: Invoice): InvoiceDetailHeaderMenuActions[] => {
  return availableActions[invoice.status]
}

type InvoiceDetailHeaderMenuProps = {
  onEditInvoice: () => void
}
export const InvoiceDetailHeaderMenu = ({ onEditInvoice }: InvoiceDetailHeaderMenuProps) => {
  const { t } = useTranslation()
  const viewState = useInvoiceDetail()
  const { toViewInvoice } = useInvoiceNavigation()
  const { addToast } = useLayerContext()
  const [openModal, setOpenModal] = useState<InvoiceActionModalType>()
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

  const onSuccessUpdateInvoice = useCallback((updatedInvoice: Invoice) => {
    toViewInvoice(updatedInvoice)
  }, [toViewInvoice])

  const onOpenChangeByMode = useCallback((mode: InvoiceActionModalType) =>
    (isOpen: boolean = true) => {
      if (isOpen) {
        setOpenModal(mode)
      }
      else {
        setOpenModal(undefined)
      }
    },
  [])

  const Trigger = useCallback(() => {
    return (
      <Button icon variant='outlined'>
        <MenuIcon size={14} />
      </Button>
    )
  }, [])

  const invoiceId = viewState.mode === UpsertMode.Update ? viewState.invoice.id : ''
  const { trigger: downloadInvoicePdf, isMutating: isDownloadingInvoicePdf } = useGetInvoicePdfDownload({
    invoiceId,
    onSuccess: ({ presignedUrl, fileName }) => {
      triggerInvisibleDownload({
        url: presignedUrl,
        filename: fileName,
      })
      addToast({ content: t('invoices:label.download_successful', 'Download successful'), type: 'success' })
    },
    onError: () => addToast({ content: t('invoices:error.download_failed', 'Download failed'), type: 'error' }),
  })

  const onDownloadInvoicePdf = () => {
    addToast({ content: t('invoices:label.download_started', 'Download started') })
    void downloadInvoicePdf()
  }

  if (viewState.mode === UpsertMode.Create) return null

  const invoice = viewState.invoice
  const invoiceActions = getInvoiceActions(invoice)
  if (!invoiceActions.length) return null

  return (
    <>
      <DropdownMenu
        ariaLabel={t('invoices:label.additional_invoice_actions', 'Additional invoice actions')}
        slots={{ Trigger }}
        slotProps={{ Dialog: { width: 160 } }}
        variant='compact'
      >
        <MenuList>
          {invoiceActions.includes(InvoiceDetailHeaderMenuActions.Edit) && (
            <MenuItem key={InvoiceDetailHeaderMenuActions.Edit} onClick={onEditInvoice}>
              <Span size='sm'>{t('common:action.edit_details', 'Edit details')}</Span>
            </MenuItem>
          )}
          {invoiceActions.includes(InvoiceDetailHeaderMenuActions.Refund) && (
            <MenuItem key={InvoiceDetailHeaderMenuActions.Refund} onClick={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Refund)}>
              <Span size='sm'>{t('invoices:action.refund_invoice', 'Issue refund')}</Span>
            </MenuItem>
          )}
          {invoiceActions.includes(InvoiceDetailHeaderMenuActions.Void) && (
            <MenuItem key={InvoiceDetailHeaderMenuActions.Void} onClick={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Void)}>
              <Span size='sm'>{t('invoices:action.mark_void', 'Mark as void')}</Span>
            </MenuItem>
          )}
          {invoiceActions.includes(InvoiceDetailHeaderMenuActions.Writeoff) && (
            <MenuItem key={InvoiceDetailHeaderMenuActions.Writeoff} onClick={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Writeoff)}>
              <Span size='sm'>{t('invoices:action.write_off', 'Write off')}</Span>
            </MenuItem>
          )}
          {invoiceActions.includes(InvoiceDetailHeaderMenuActions.Reset) && (
            <MenuItem key={InvoiceDetailHeaderMenuActions.Reset} onClick={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Reset)}>
              <Span size='sm'>{t('invoices:action.reset_to_saved', 'Reset to saved')}</Span>
            </MenuItem>
          )}
          {invoiceActions.includes(InvoiceDetailHeaderMenuActions.DownloadPdf) && (
            <MenuItem
              key={InvoiceDetailHeaderMenuActions.DownloadPdf}
              isDisabled={isDownloadingInvoicePdf}
              onClick={onDownloadInvoicePdf}
            >
              <Span size='sm'>{t('invoices:action.download_pdf', 'Download PDF')}</Span>
            </MenuItem>
          )}
        </MenuList>
      </DropdownMenu>
      <InvisibleDownload ref={invisibleDownloadRef} />
      <InvoiceRefundModal
        isOpen={openModal === InvoiceDetailHeaderMenuActions.Refund}
        onOpenChange={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Refund)}
        invoice={invoice}
        onSuccess={onSuccessUpdateInvoice}
      />
      <InvoiceVoidConfirmationModal
        isOpen={openModal === InvoiceDetailHeaderMenuActions.Void}
        onOpenChange={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Void)}
        invoiceId={invoice.id}
        onSuccess={onSuccessUpdateInvoice}
      />
      <InvoiceWriteoffConfirmationModal
        isOpen={openModal === InvoiceDetailHeaderMenuActions.Writeoff}
        onOpenChange={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Writeoff)}
        invoice={invoice}
        onSuccess={onSuccessUpdateInvoice}
      />
      <InvoiceResetConfirmationModal
        isOpen={openModal === InvoiceDetailHeaderMenuActions.Reset}
        onOpenChange={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Reset)}
        invoice={invoice}
        onSuccess={onSuccessUpdateInvoice}
      />
    </>
  )
}
