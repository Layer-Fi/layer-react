import { type RefObject, useEffect, useRef } from 'react'

import type { ModalVariant } from './Modal'

const isFormElement = (element: Element): element is HTMLElement =>
  element instanceof HTMLElement
  && (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) || element.isContentEditable)

export function useMobileDrawerViewport(
  isOpen: boolean,
  variant: ModalVariant,
  overlayRef: RefObject<HTMLElement | null>,
  dialogRef: RefObject<HTMLElement | null>,
) {
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
      if (activeElement && isFormElement(activeElement) && dialogRef.current?.contains(activeElement)) {
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
  }, [isOpen, variant, overlayRef, dialogRef])

  useEffect(() => {
    if (!isOpen || variant !== 'mobile-drawer') return
    const dialogElement = dialogRef.current
    if (!dialogElement) return

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (target instanceof Element && isFormElement(target)) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ block: 'center', inline: 'nearest' })
        })
      }
    }

    dialogElement.addEventListener('focusin', handleFocusIn)
    return () => {
      dialogElement.removeEventListener('focusin', handleFocusIn)
    }
  }, [isOpen, variant, dialogRef])
}
