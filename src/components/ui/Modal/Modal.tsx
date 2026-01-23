import { type ComponentProps, forwardRef, type PropsWithChildren, useEffect, useRef } from 'react'
import {
  Dialog as ReactAriaDialog,
  type DialogProps,
  type DialogRenderProps,
  Modal as ReactAriaModal,
  ModalOverlay as ReactAriaModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'

import './modal.scss'

type ModalSize = 'md' | 'lg' | 'xl'
type ModalVariant = 'center' | 'drawer' | 'mobile-drawer' | 'mobile-popover'

const BASE_MODAL_OVERLAY_CLASS_NAME = 'Layer__ModalOverlay'
const MODAL_OVERLAY_CLASS_NAME = `Layer__Portal ${BASE_MODAL_OVERLAY_CLASS_NAME}`

const ModalOverlay = forwardRef<
  HTMLElementTagNameMap['div'],
  Omit<ModalOverlayProps, 'className'> & { variant: ModalVariant }
>(({ variant, ...restProps }, ref) => {
  const dataProperties = toDataProperties({ variant })

  return (
    <ReactAriaModalOverlay
      {...dataProperties}
      {...restProps}
      className={MODAL_OVERLAY_CLASS_NAME}
      ref={ref}
    />
  )
},
)
ModalOverlay.displayName = 'ModalOverlay'

const MODAL_CLASS_NAME = 'Layer__Modal'
const InternalModal = forwardRef<
  HTMLElementTagNameMap['div'],
  PropsWithChildren<{
    size?: ModalSize
    flexBlock?: boolean
    flexInline?: boolean
    variant?: ModalVariant
  }>
>(({ children, flexBlock, flexInline, size, variant = 'center' }, ref) => {
  const dataProperties = toDataProperties({ size, 'flex-block': flexBlock, 'flex-inline': flexInline, variant })

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
InternalModal.displayName = 'Modal'

const DIALOG_CLASS_NAME = 'Layer__Dialog'
const Dialog = forwardRef<
  HTMLElement,
  Omit<DialogProps, 'className'> & { variant: ModalVariant, scrollable?: boolean }
>(({ variant = 'center', scrollable, ...restProps }, ref) => {
  const dataProperties = toDataProperties({ variant, scrollable })

  return (
    <ReactAriaDialog
      {...dataProperties}
      {...restProps}
      className={DIALOG_CLASS_NAME}
      ref={ref}
    />
  )
},
)
Dialog.displayName = 'Dialog'

type DialogChildren = DialogProps['children']
type MobileHeaderProps = {
  MobileHeader?: DialogChildren
}

const resolveDialogChildren = (children: DialogChildren, MobileHeader?: DialogChildren): DialogChildren => {
  if (!MobileHeader) return children

  if (typeof children === 'function' || typeof MobileHeader === 'function') {
    function DialogChildrenWithMobileHeader(renderProps: DialogRenderProps) {
      return (
        <>
          {typeof MobileHeader === 'function' ? MobileHeader(renderProps) : MobileHeader}
          {typeof children === 'function' ? children(renderProps) : children}
        </>
      )
    }
    return DialogChildrenWithMobileHeader
  }

  return (
    <>
      {MobileHeader}
      {children}
    </>
  )
}

type AllowedModalOverlayProps = Pick<
  ComponentProps<typeof ModalOverlay>,
  'isOpen' | 'onOpenChange' | 'isDismissable'
>

type AllowedInternalModalProps = Pick<
  ComponentProps<typeof InternalModal>,
  'flexBlock' | 'flexInline' | 'size' | 'variant'
>

type AllowedDialogProps = Pick<
  ComponentProps<typeof Dialog>,
  'children' | 'role' | 'aria-label'
>

export type ModalProps = AllowedModalOverlayProps &
  AllowedInternalModalProps &
  AllowedDialogProps &
  MobileHeaderProps

export function Modal({
  isOpen,
  size = 'md',
  flexBlock,
  flexInline,
  onOpenChange,
  children,
  'aria-label': ariaLabel,
  role,
  variant = 'center',
  isDismissable = false,
  MobileHeader,
}: ModalProps) {
  const dialogChildren = resolveDialogChildren(children, MobileHeader)
  const isScrollable = Boolean(MobileHeader)

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} variant={variant} isDismissable={isDismissable}>
      <InternalModal flexBlock={flexBlock} flexInline={flexInline} size={size} variant={variant}>
        <Dialog role={role ?? 'dialog'} aria-label={ariaLabel} variant={variant} scrollable={isScrollable}>
          {dialogChildren}
        </Dialog>
      </InternalModal>
    </ModalOverlay>
  )
}

type AllowedInternalDrawerProps = Pick<
  ComponentProps<typeof InternalModal>,
  'size'
> & { variant?: Extract<ModalVariant, 'drawer' | 'mobile-drawer'> }

export type DrawerProps = AllowedModalOverlayProps &
  AllowedInternalDrawerProps &
  AllowedDialogProps &
  AllowedInternalModalProps &
  MobileHeaderProps

export function Drawer({
  isOpen,
  onOpenChange,
  size = 'md',
  flexBlock,
  flexInline,
  children,
  'aria-label': ariaLabel,
  variant = 'drawer',
  isDismissable = false,
  role,
  MobileHeader,
}: DrawerProps) {
  const overlayRef = useRef<HTMLElementTagNameMap['div']>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const layoutViewportHeightRef = useRef<number | null>(null)
  const layoutViewportWidthRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isOpen || variant !== 'mobile-drawer' || typeof window === 'undefined') return
    const overlayElement = overlayRef.current
    if (!overlayElement) return
    layoutViewportHeightRef.current = window.innerHeight
    layoutViewportWidthRef.current = window.innerWidth
    const updateViewportMetrics = () => {
      const visualViewport = window.visualViewport
      const height = visualViewport?.height ?? window.innerHeight
      const offsetTop = visualViewport?.offsetTop ?? 0
      const currentInnerHeight = window.innerHeight
      const currentInnerWidth = window.innerWidth
      if (layoutViewportWidthRef.current !== currentInnerWidth) {
        layoutViewportWidthRef.current = currentInnerWidth
        layoutViewportHeightRef.current = currentInnerHeight
      }
      else {
        layoutViewportHeightRef.current = Math.max(layoutViewportHeightRef.current ?? 0, currentInnerHeight)
      }
      const layoutViewportHeight = layoutViewportHeightRef.current ?? currentInnerHeight
      const offsetBottom = Math.max(0, layoutViewportHeight - height - offsetTop)
      overlayElement.style.setProperty('--visual-viewport-height', `${height}px`)
      overlayElement.style.setProperty('--visual-viewport-offset-bottom', `${offsetBottom}px`)
      const activeElement = document.activeElement
      if (
        activeElement instanceof HTMLElement
        && dialogRef.current?.contains(activeElement)
        && (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) || activeElement.isContentEditable)
      ) {
        activeElement.scrollIntoView({ block: 'center', inline: 'nearest' })
      }
    }
    updateViewportMetrics()
    const visualViewport = window.visualViewport
    visualViewport?.addEventListener('resize', updateViewportMetrics)
    visualViewport?.addEventListener('scroll', updateViewportMetrics)
    window.addEventListener('resize', updateViewportMetrics)
    return () => {
      visualViewport?.removeEventListener('resize', updateViewportMetrics)
      visualViewport?.removeEventListener('scroll', updateViewportMetrics)
      window.removeEventListener('resize', updateViewportMetrics)
      overlayElement.style.removeProperty('--visual-viewport-height')
      overlayElement.style.removeProperty('--visual-viewport-offset-bottom')
      layoutViewportHeightRef.current = null
      layoutViewportWidthRef.current = null
    }
  }, [isOpen, variant])

  useEffect(() => {
    if (!isOpen || variant !== 'mobile-drawer') return
    const dialogElement = dialogRef.current
    if (!dialogElement) return
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (
        target instanceof HTMLElement
        && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)
      ) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ block: 'center', inline: 'nearest' })
        })
      }
    }
    dialogElement.addEventListener('focusin', handleFocusIn)
    return () => {
      dialogElement.removeEventListener('focusin', handleFocusIn)
    }
  }, [isOpen, variant])

  const dialogChildren = resolveDialogChildren(children, MobileHeader)
  const isScrollable = Boolean(MobileHeader)

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      variant={variant}
      isDismissable={isDismissable}
      ref={overlayRef}
    >
      <InternalModal flexBlock={flexBlock} flexInline={flexInline} size={size} variant={variant}>
        <Dialog
          role={role ?? 'dialog'}
          aria-label={ariaLabel}
          variant={variant}
          ref={dialogRef}
          scrollable={isScrollable}
        >
          {dialogChildren}
        </Dialog>
      </InternalModal>
    </ModalOverlay>
  )
}
