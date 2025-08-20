import { type ComponentProps } from 'react'
import { Modal, Dialog, type ModalProps } from './Modal'

type AllowedDialogProps = Pick<
  ComponentProps<typeof Dialog>,
  'role' | 'aria-label'
>

export type DialogModalProps = ModalProps & AllowedDialogProps

export function DialogModal({
  'aria-label': ariaLabel,
  role,
  children,
  ...modalProps
}: DialogModalProps) {
  return (
    <Modal {...modalProps}>
      <Dialog role={role ?? 'dialog'} aria-label={ariaLabel}>
        {children}
      </Dialog>
    </Modal>
  )
}
