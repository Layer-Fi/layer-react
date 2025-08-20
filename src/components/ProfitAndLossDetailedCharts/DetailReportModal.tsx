import { forwardRef } from 'react'
import {
  Dialog as ReactAriaDialog,
  type DialogProps,
  Modal as ReactAriaModal,
  ModalOverlay as ReactAriaModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components'
import { ProfitAndLossDetailReport, type ProfitAndLossDetailReportProps } from '../ProfitAndLossDetailReport/ProfitAndLossDetailReport'
import { BreadcrumbItem } from '../DetailReportBreadcrumb/DetailReportBreadcrumb'
import { ReportModal } from '../ui/Modal/ReportModal'
import { type SelectedLineItem } from '../ProfitAndLossReport/ProfitAndLossReport'

const MODAL_OVERLAY_CLASS_NAME = 'Layer__DetailReportModalOverlay'
const MODAL_OVERLAY_CLASS_NAMES = `Layer__Portal ${MODAL_OVERLAY_CLASS_NAME}`

const ModalOverlay = forwardRef<
  HTMLElementTagNameMap['div'],
  Omit<ModalOverlayProps, 'className'>
>((props, ref) => (
  <ReactAriaModalOverlay
    {...props}
    className={MODAL_OVERLAY_CLASS_NAMES}
    ref={ref}
  />
),
)
ModalOverlay.displayName = 'DetailReportModalOverlay'

const MODAL_CLASS_NAME = 'Layer__DetailReportModal'
const InternalModal = forwardRef<
  HTMLElementTagNameMap['div'],
  { children: React.ReactNode }
>(({ children }, ref) => {
  return (
    <ReactAriaModal
      className={MODAL_CLASS_NAME}
      ref={ref}
    >
      {children}
    </ReactAriaModal>
  )
})

InternalModal.displayName = 'DetailReportModal'

const DIALOG_CLASS_NAME = 'Layer__DetailReportDialog'
const Dialog = forwardRef<
  HTMLElement,
  Omit<DialogProps, 'className'>
>(({ ...props }, ref) => (
  <ReactAriaDialog
    {...props}
    className={DIALOG_CLASS_NAME}
    ref={ref}
  />
),
)

Dialog.displayName = 'DetailReportDialog'

export interface DetailReportModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  selectedItem: SelectedLineItem | null
  onBreadcrumbClick?: (lineItemName: string) => void
  stringOverrides?: ProfitAndLossDetailReportProps['stringOverrides']
}

export function DetailReportModal({
  isOpen,
  onOpenChange,
  selectedItem,
  onBreadcrumbClick,
  stringOverrides,
}: DetailReportModalProps) {
  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <ReportModal isOpen={isOpen} onOpenChange={onOpenChange} size='4xl' aria-label='Profit and Loss Detail Report'>
      {selectedItem && selectedItem.lineItemName && (
        <ProfitAndLossDetailReport
          lineItemName={selectedItem.lineItemName}
          breadcrumbPath={selectedItem.breadcrumbPath}
          onClose={handleClose}
          onBreadcrumbClick={onBreadcrumbClick}
          stringOverrides={stringOverrides}
          maxVisibleRows={10}
        />
      )}
    </ReportModal>
  )
}
