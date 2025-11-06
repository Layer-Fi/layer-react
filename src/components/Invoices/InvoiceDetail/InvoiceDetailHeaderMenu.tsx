import { Button } from '../../ui/Button/Button'
import { useCallback, useState } from 'react'
import { Span } from '../../ui/Typography/Text'
import { Menu as MenuIcon } from 'lucide-react'
import { useInvoiceDetail, useInvoiceNavigation } from '../../../providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { DropdownMenu, MenuItem, MenuList } from '../../ui/DropdownMenu/DropdownMenu'
import { UpsertInvoiceMode } from '../../../features/invoices/api/useUpsertInvoice'
import { InvoiceStatus, type Invoice } from '../../../features/invoices/invoiceSchemas'
import { InvoiceVoidModal } from '../Modal/InvoiceVoidModal'
import { InvoiceWriteoffModal } from '../Modal/InvoiceWriteoffModal'
import { InvoiceResetModal } from '../Modal/InvoiceResetModal'
import { InvoiceRefundModal } from '../Modal/InvoiceRefundModal'

enum InvoiceDetailHeaderMenuActions {
  Edit = 'Edit',
  Void = 'Void',
  Refund = 'Refund',
  Writeoff = 'Writeoff',
  Reset = 'Reset',
}

type InvoiceActionModalType = Exclude<InvoiceDetailHeaderMenuActions, InvoiceDetailHeaderMenuActions.Edit>

const availableActions: Record<InvoiceStatus, InvoiceDetailHeaderMenuActions[]> = {
  [InvoiceStatus.Sent]: [
    InvoiceDetailHeaderMenuActions.Edit,
    InvoiceDetailHeaderMenuActions.Void,
    InvoiceDetailHeaderMenuActions.Writeoff,
  ],
  [InvoiceStatus.PartiallyPaid]: [
    InvoiceDetailHeaderMenuActions.Writeoff,
    InvoiceDetailHeaderMenuActions.Reset,
  ],
  [InvoiceStatus.Paid]: [
    InvoiceDetailHeaderMenuActions.Refund,
    InvoiceDetailHeaderMenuActions.Reset,
  ],
  [InvoiceStatus.Voided]: [InvoiceDetailHeaderMenuActions.Reset],
  [InvoiceStatus.PartiallyWrittenOff]: [InvoiceDetailHeaderMenuActions.Reset],
  [InvoiceStatus.WrittenOff]: [InvoiceDetailHeaderMenuActions.Reset],
  [InvoiceStatus.Refunded]: [InvoiceDetailHeaderMenuActions.Reset],
}

const getInvoiceActions = (invoice: Invoice): InvoiceDetailHeaderMenuActions[] => {
  return availableActions[invoice.status]
}

type InvoiceDetailHeaderMenuProps = {
  onEditInvoice: () => void
}
export const InvoiceDetailHeaderMenu = ({ onEditInvoice }: InvoiceDetailHeaderMenuProps) => {
  const viewState = useInvoiceDetail()
  const { toViewInvoice } = useInvoiceNavigation()
  const [openModal, setOpenModal] = useState<InvoiceActionModalType>()

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

  if (viewState.mode === UpsertInvoiceMode.Create) return null

  const invoice = viewState.invoice
  const invoiceActions = getInvoiceActions(invoice)
  if (!invoiceActions.length) return null

  return (
    <>
      <DropdownMenu
        ariaLabel='Additional invoice actions'
        slots={{ Trigger }}
        slotProps={{ Dialog: { width: 160 } }}
        variant='compact'
      >
        <MenuList>
          {invoiceActions.includes(InvoiceDetailHeaderMenuActions.Edit) && (
            <MenuItem key={InvoiceDetailHeaderMenuActions.Edit} onClick={onEditInvoice}>
              <Span size='sm'>Edit details</Span>
            </MenuItem>
          )}
          {invoiceActions.includes(InvoiceDetailHeaderMenuActions.Refund) && (
            <MenuItem key={InvoiceDetailHeaderMenuActions.Refund} onClick={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Refund)}>
              <Span size='sm'>Issue refund</Span>
            </MenuItem>
          )}
          {invoiceActions.includes(InvoiceDetailHeaderMenuActions.Void) && (
            <MenuItem key={InvoiceDetailHeaderMenuActions.Void} onClick={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Void)}>
              <Span size='sm'>Cancel/Void</Span>
            </MenuItem>
          )}
          {invoiceActions.includes(InvoiceDetailHeaderMenuActions.Writeoff) && (
            <MenuItem key={InvoiceDetailHeaderMenuActions.Writeoff} onClick={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Writeoff)}>
              <Span size='sm'>Write off</Span>
            </MenuItem>
          )}
          {invoiceActions.includes(InvoiceDetailHeaderMenuActions.Reset) && (
            <MenuItem key={InvoiceDetailHeaderMenuActions.Reset} onClick={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Reset)}>
              <Span size='sm'>Reset to sent</Span>
            </MenuItem>
          )}
        </MenuList>
      </DropdownMenu>
      <InvoiceRefundModal
        isOpen={openModal === InvoiceDetailHeaderMenuActions.Refund}
        onOpenChange={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Refund)}
        invoice={invoice}
        onSuccess={onSuccessUpdateInvoice}
      />
      <InvoiceVoidModal
        isOpen={openModal === InvoiceDetailHeaderMenuActions.Void}
        onOpenChange={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Void)}
        invoiceId={invoice.id}
        onSuccess={onSuccessUpdateInvoice}
      />
      <InvoiceWriteoffModal
        isOpen={openModal === InvoiceDetailHeaderMenuActions.Writeoff}
        onOpenChange={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Writeoff)}
        invoice={invoice}
        onSuccess={onSuccessUpdateInvoice}
      />
      <InvoiceResetModal
        isOpen={openModal === InvoiceDetailHeaderMenuActions.Reset}
        onOpenChange={onOpenChangeByMode(InvoiceDetailHeaderMenuActions.Reset)}
        invoice={invoice}
        onSuccess={onSuccessUpdateInvoice}
      />
    </>
  )
}
