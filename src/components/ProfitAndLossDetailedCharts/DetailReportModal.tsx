import { forwardRef, type ComponentProps } from 'react'
import {
  Dialog as ReactAriaDialog,
  type DialogProps,
  Modal as ReactAriaModal,
  ModalOverlay as ReactAriaModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components'
import { ProfitAndLossDetailReport, type ProfitAndLossDetailReportProps } from '../ProfitAndLossDetailReport/ProfitAndLossDetailReport'
import { BreadcrumbItem } from '../DetailReportBreadcrumb/DetailReportBreadcrumb'
import { LineBaseItem } from '../../types/line_item'

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
  selectedItem: LineBaseItem | null
  breadcrumbPath?: BreadcrumbItem[]
  onBreadcrumbClick?: (lineItemName: string) => void
  stringOverrides?: ProfitAndLossDetailReportProps['stringOverrides']
}

export function DetailReportModal({
  isOpen,
  onOpenChange,
  selectedItem,
  breadcrumbPath,
  onBreadcrumbClick,
  stringOverrides,
}: DetailReportModalProps) {
  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
      <InternalModal>
        <Dialog role='dialog' aria-label='Profit and Loss Detail Report'>
          {selectedItem && selectedItem.name && (
            <ProfitAndLossDetailReport
              lineItemName={selectedItem.name}
              breadcrumbPath={breadcrumbPath}
              onClose={handleClose}
              onBreadcrumbClick={onBreadcrumbClick}
              stringOverrides={stringOverrides}
            />
          )}
        </Dialog>
      </InternalModal>
    </ModalOverlay>
  )
}