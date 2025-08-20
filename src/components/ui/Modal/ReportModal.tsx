import { forwardRef, type ComponentProps, type PropsWithChildren } from 'react'
import {
  Modal as ReactAriaModal,
  ModalOverlay as ReactAriaModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

type ModalSize = 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'

const MODAL_OVERLAY_CLASS_NAME = 'Layer__ModalOverlay'
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
ModalOverlay.displayName = 'ReportModalOverlay'

const MODAL_CLASS_NAME = 'Layer__Modal'
const InternalModal = forwardRef<
  HTMLElementTagNameMap['div'],
  PropsWithChildren<{ size?: ModalSize, flexBlock?: boolean }>
>(({ children, flexBlock, size }, ref) => {
  const dataProperties = toDataProperties({ size, 'flex-block': flexBlock })

  return (
    <ReactAriaModal
      {...dataProperties}
      className={MODAL_CLASS_NAME}
      ref={ref}
    >
      {children}
    </ReactAriaModal>
  )
})

InternalModal.displayName = 'ReportModal'

type AllowedModalOverlayProps = Pick<
  ComponentProps<typeof ModalOverlay>,
  'isOpen' | 'onOpenChange'
>
type AllowedInternalModalProps = Pick<
  ComponentProps<typeof InternalModal>,
  'flexBlock' | 'size'
>

export type ReportModalProps = AllowedModalOverlayProps & AllowedInternalModalProps & PropsWithChildren

export function ReportModal({
  isOpen,
  size = '4xl',
  flexBlock,
  onOpenChange,
  children,
}: ReportModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
      <InternalModal flexBlock={flexBlock} size={size}>
        {children}
      </InternalModal>
    </ModalOverlay>
  )
}